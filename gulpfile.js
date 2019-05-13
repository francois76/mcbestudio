const MinecraftAddonBuilder = require("minecraft-addon-toolchain/v1");
const TypeScriptSupport = require("minecraft-addon-toolchain-typescript");

const builder = new MinecraftAddonBuilder("MCBE Studio");
builder.addPlugin(new TypeScriptSupport());
module.exports = builder.configureEverythingForMe();