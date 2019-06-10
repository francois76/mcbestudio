const MinecraftAddonBuilder = require("minecraft-addon-toolchain/v1");
const TypeScriptSupport = require("minecraft-addon-toolchain-typescript");
const TerserSupport = require("minecraft-addon-toolchain-terser");
const BrowserifySupport = require("minecraft-addon-toolchain-browserify");

const builder = new MinecraftAddonBuilder("MCBE Studio");
builder.addPlugin(new TypeScriptSupport());
builder.addPlugin(new BrowserifySupport);
module.exports = builder.configureEverythingForMe();