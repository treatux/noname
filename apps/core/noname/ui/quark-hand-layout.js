// Presentation-only arithmetic adapted from supplied 十周年UI/extension.js
// updateHand:9795-9877. Does not depend on cards, events, rules or AI.
export function computeQuarkHandLayout({count, width, cardWidth, cardHeight, scale, fold}) {
 const scaledWidth = cardWidth * scale;
 let margin = scaledWidth, expand = false;
 const start = (scaledWidth - cardWidth) / 2;
 const y = Math.round((cardHeight * scale - cardHeight) / 2);
 if (count > 1 && count * scaledWidth + (count - 1) * 2 > width) {
  margin = scaledWidth - Math.abs(width - scaledWidth * count) / (count - 1);
  if (fold && margin < 27 * scale) {margin = 27 * scale;expand = true;}
 }
 return {margin, expand, y, positions:Array.from({length:count}, (_, i) => Math.round(start + i * margin)), width:expand ? Math.round(count * margin + scaledWidth - margin) : null};
}
