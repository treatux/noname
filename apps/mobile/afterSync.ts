import { copyFileSync, existsSync, mkdirSync, readdirSync, renameSync, rmSync } from "fs";
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
