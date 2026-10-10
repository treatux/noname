import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync, renameSync, rmSync } from "fs";
import { resolve } from "path";
import { spawnSync } from "child_process";
import { build } from "vite";

const root = import.meta.dirname;
const workspaceRoot = resolve(root, "../..");
const distDir = resolve(workspaceRoot, "dist");
const preloadOutDir = resolve(root, ".mobile-preload");
const androidAssetsNodeModules = resolve(root, "android/app/src/main/assets/public/node_modules");

function cleanOldPreloadArtifacts() {
	if (!existsSync(distDir)) return;

	for (const name of readdirSync(distDir)) {
		if (/^(preload(?:-.+)?|web-.+|index\.esm-.+)\.js$/.test(name)) {
			rmSync(resolve(distDir, name), { force: true });
		}
	}
}

async function buildPreload() {
	rmSync(preloadOutDir, { recursive: true, force: true });
	cleanOldPreloadArtifacts();

	await build({
		root,
		configFile: false,
		define: {
			"import.meta.env.NONAME_TEST_PACKAGED": JSON.stringify(process.env.NONAME_TEST_PACKAGED || "0"),
		},
		build: {
			outDir: preloadOutDir,
			emptyOutDir: true,
			target: ["chrome91", "safari16.4"],
			sourcemap: false,
			minify: false,
			lib: {
				entry: resolve(root, "src/preload.ts"),
				formats: ["es"],
				fileName: () => "preload.js",
			},
			rollupOptions: {
				output: {
					inlineDynamicImports: true,
					assetFileNames: "preload-[name][extname]",
				},
			},
		},
	});

	mkdirSync(distDir, { recursive: true });
	copyFileSync(resolve(preloadOutDir, "preload.js"), resolve(distDir, "preload.js"));
	rmSync(preloadOutDir, { recursive: true, force: true });
}

function capSync() {
	const command = process.platform === "win32" ? "cmd" : "cap";
	const args = process.platform === "win32" ? ["/c", "cap", "sync"] : ["sync"];
	const result = spawnSync(command, args, {
		cwd: root,
		stdio: "inherit",
	});

	if (result.status !== 0) {
		throw new Error(
			`cap sync failed with exit code ${result.status ?? "unknown"}${result.error ? `: ${result.error.message}` : ""}`
		);
	}
}

function patchAndroidAssets() {
	const pnpmDir = resolve(androidAssetsNodeModules, ".pnpm");
	const androidSafePnpmDir = resolve(androidAssetsNodeModules, "_pnpm");

	if (!existsSync(pnpmDir)) return;

	if (existsSync(androidSafePnpmDir)) {
		rmSync(androidSafePnpmDir, { recursive: true, force: true });
	}

	renameSync(pnpmDir, androidSafePnpmDir);
}

await buildPreload();
capSync();
patchAndroidAssets();

// Some WebView versions initialize injected modules before the document import
// map is usable. Resolve known externals in the optional packaged test assets.
// This changes generated assets only, not upstream source or the default build.
if (process.env.NONAME_TEST_PACKAGED === "1") {
	const assets = resolve(root, "android/app/src/main/assets/public");
	const indexPath = resolve(assets, "index.html");
	let html = readFileSync(indexPath, "utf8");
	const match = html.match(/<script type="importmap">([\s\S]*?)<\/script>/);
	if (!match) throw new Error("Packaged test assets lack an import map");
	const imports = JSON.parse(match[1]).imports as Record<string, string>;
	let changed = 0;
	function visit(dir: string) {
		for (const item of readdirSync(dir, { withFileTypes: true })) {
			const path = resolve(dir, item.name);
			if (item.isDirectory()) {
				if (item.name !== "src") visit(path);
			} else if (item.name.endsWith(".js") || item.name.endsWith(".mjs")) {
				const original = readFileSync(path, "utf8");
				const updated = original.replace(/(\bfrom\s*|\bimport\s*\(\s*|\bimport\s*)(["'])(noname|vue|pinyin-pro|dedent)\2/g,
					(full, prefix, quote, name) => imports[name] ? `${prefix}${quote}${imports[name]}${quote}` : full);
				if (updated !== original) { writeFileSync(path, updated); changed++; }
			}
		}
	}
	visit(assets);
	for (const [name, path] of Object.entries(imports)) html = html.replaceAll(`src="${name}"`, `src="${path}"`);
	writeFileSync(indexPath, html);
	console.log(`Packaged WebView externals resolved in ${changed} generated modules.`);
}

// Optional silent test package for devices with limited storage.
// The default build keeps all upstream audio resources.
if (process.env.NONAME_TEST_SILENT === "1") {
	rmSync(resolve(root, "android/app/src/main/assets/public/audio"), { recursive: true, force: true });
	console.log("Silent test APK: audio assets omitted; game rules and modes preserved.");
}

// APK incremental ZIP rewriting can retain megabytes of deleted asset data.
// Clean generated package state when switching resource variants.
if (process.env.NONAME_TEST_SILENT === "1" || process.env.NONAME_TEST_PACKAGED === "1") {
	for (const path of ["outputs/apk/debug", "intermediates/incremental/packageDebug", "intermediates/incremental/mergeDebugAssets"]) {
		rmSync(resolve(root, "android/app/build", path), { recursive: true, force: true });
	}
}
