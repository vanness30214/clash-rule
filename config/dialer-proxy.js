function operator(proxies = [], targetPlatform, context) {
const LANDING_MARK = /自建住宅/;
const CHAIN_MARK = "链式｜";

// 允许作为自建落地复制成链式节点的协议
const ALLOWED_TYPES = new Set(["ss", "shadowsocks", "trojan"]);

const output = [...proxies];

function stripProtocolPrefix(name) {
return String(name || "")
.replace(/^[[^]]+]\s*/, "")
.trim();
}

function getProtocolLabel(proxy) {
const type = String(proxy.type || "").toLowerCase();

if (type === "ss" || type === "shadowsocks") return "SS";
if (type === "trojan") return "Trojan";

const name = String(proxy.name || "");
const match = name.match(/^\[([^\]]+)\]/);
if (match) return match[1];

return "Proxy";

}

function cleanLandingName(name) {
return stripProtocolPrefix(name)
.replace(/^链式｜/, "")
.replace(/^(SS|Trojan|VMess|VLESS|Shadowsocks)｜/i, "")
.replace(/[-_｜\s]*(trojan|ss|shadowsocks)$/i, "")
.trim();
}

function transitGroupName(baseName, protocolLabel) {
return 🔁 中转选择｜${baseName}-${protocolLabel};
}

const existingNormalizedNames = new Set(
proxies.map(p => stripProtocolPrefix(p.name))
);

for (const proxy of proxies) {
const name = proxy.name || "";
const type = String(proxy.type || "").toLowerCase();

if (!LANDING_MARK.test(name)) continue;
if (name.includes(CHAIN_MARK)) continue;
if (!ALLOWED_TYPES.has(type)) continue;

const protocolLabel = getProtocolLabel(proxy);
const baseName = cleanLandingName(name);

const chainName = `${CHAIN_MARK}${protocolLabel}｜${baseName}`;

if (existingNormalizedNames.has(chainName)) continue;

const chain = JSON.parse(JSON.stringify(proxy));

chain.name = chainName;

// SS / Trojan 分别跟随不同的中转选择组
chain["dialer-proxy"] = transitGroupName(baseName, protocolLabel);

delete chain["underlying-proxy"];

output.push(chain);
existingNormalizedNames.add(chainName);

}

return output;
}
