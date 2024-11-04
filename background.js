console.log(`B2B support script`);

chrome.runtime.onInstalled.addListener(() => {
    console.log("Extension installed");
    updateRedirectRules();
});

function updateRedirectRules() {
    chrome.storage.sync.get("redirectDomain", (data) => {
        const domain = data.redirectDomain || "https://dev-b2b-solution-support-21.dev-bsscommerce.com";

        const modules = ["cp", "qb", "dc", "td", "pl", "bogo", "ef", "on"];

        const mdRules = modules.map((md, index) => ({
            id: index + 1,
            priority: 1,
            action: {
                type: "redirect",
                redirect: {
                    url: `${domain}/bss-b2b-chunk-${md}.js`,
                },
            },
            condition: {
                urlFilter: `https://cdn.shopify.com/extensions/*/assets/bss-b2b-chunk-${md}.js`,
                resourceTypes: ["script"],
            },
        }));

        const rules = [
            {
                id: 20,
                priority: 1,
                action: {
                    type: "redirect",
                    redirect: {
                        url: `${domain}/bss-b2b-js.js`,
                    },
                },
                condition: {
                    urlFilter: "https://cdn.shopify.com/extensions/*/assets/bss-b2b-js.js",
                    resourceTypes: ["script"],
                },
            },
            {
                id: 21,
                priority: 1,
                action: {
                    type: "redirect",
                    redirect: {
                        url: `${domain}/bss-b2b-v3.js`,
                    },
                },
                condition: {
                    urlFilter: "https://cdn.shopify.com/extensions/*/assets/bss-b2b-v3.js",
                    resourceTypes: ["script"],
                },
            },
        ];

        rules.push(...mdRules);

        chrome.declarativeNetRequest.getDynamicRules((oldRules) => {
            const ruleIds = [];
            for (const rule of oldRules) {
                ruleIds.push(rule.id);
            }
            chrome.declarativeNetRequest.updateDynamicRules(
                {
                    removeRuleIds: ruleIds,
                },
                () => {
                    if (chrome.runtime.lastError) {
                        console.error("Error removing rules:", chrome.runtime.lastError);
                    } else {
                        console.log("All rules removed successfully.");
                    }
                }
            );
            
            chrome.declarativeNetRequest.updateDynamicRules(
                {
                    addRules: rules,
                },
                () => {
                    if (chrome.runtime.lastError) {
                        console.error("Failed to add dynamic rules:", chrome.runtime.lastError);
                    } else {
                        console.log("Dynamic rules updated successfully");
                        chrome.declarativeNetRequest.getDynamicRules((rules) => {
                            console.log("Current dynamic rules:", rules);
                        });
                    }
                }
            );
        });
    });
}

chrome.storage.onChanged.addListener((changes, area) => {
    if (area === "sync" && changes.redirectDomain) {
        updateRedirectRules();
    }
});
