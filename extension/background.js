console.log(`B2B support script`);

chrome.runtime.onInstalled.addListener(() => {
    console.log("Extension installed");
    updateRedirectRules();
});

function updateRedirectRules() {
    chrome.storage.sync.get("redirectDomain", (data) => {
        const domain = data.redirectDomain || "http://localhost:4021";

        const modules = ["cp", "dc", "td", "pl", "bogo", "ef", "on", "sr", "te", "qb", "mc"];
        const urls = [
            { url: `${domain}/bss-b2b-rf-js.js`, urlFilter: `https://cdn.shopify.com/extensions/*/assets/bss-b2b-rf-js.js` },
            { url: `${domain}/bss-b2b-js.js`, urlFilter: `https://cdn.shopify.com/extensions/*/assets/bss-b2b-js.js` },
            { url: `${domain}/bss-b2b-v3.js`, urlFilter: `https://cdn.shopify.com/extensions/*/assets/bss-b2b-v3.js` },
            // { url: `https://dev-subscriptions-api-21.dev-bsscommerce.com/bss-sub-form.js`, urlFilter: `https://cdn.shopify.com/extensions/*/assets/bss-sub-form.js` },
            // { url: `https://dev-subscriptions-api-21.dev-bsscommerce.com/bss-sub.js`, urlFilter: `https://cdn.shopify.com/extensions/*/assets/bss-sub.js` },
            { url: `http://localhost:4200/bss-sub-com.js`, urlFilter: `https://cdn.shopify.com/extensions/*/assets/bss-sub-com.js` },
            { url: `http://localhost:4200/bss-sub-v2.js`, urlFilter: `https://cdn.shopify.com/extensions/*/assets/bss-sub-v2.js` },
            { url: `http://localhost:4200/bss-sub-default-template.js`, urlFilter: `https://cdn.shopify.com/extensions/*/assets/bss-sub-default-template.js` },
            { url: `http://localhost:4200/bss-sub-grid-template.js`, urlFilter: `https://cdn.shopify.com/extensions/*/assets/bss-sub-grid-template.js` },
            { url: `http://localhost:4200/bss-sub-lit-vendor.js`, urlFilter: `https://cdn.shopify.com/extensions/*/assets/bss-sub-lit-vendor.js` },
        ];

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

        const rules = urls.map((item, index) => {
            return {
                id: modules.length + index + 1,
                priority: 1,
                action: {
                    type: "redirect",
                    redirect: {
                        url: item.url,
                    },
                },
                condition: {
                    urlFilter: item.urlFilter,
                    resourceTypes: ["script"],
                },
            };
        });

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

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === "complete" && tab.url?.includes("myshopify.com")) {
        chrome.scripting.executeScript({
            target: { tabId: tabId },
            func: () =>
                console.log("%cB2B support mode", "font-size: 20px; font-weight: bold; color: #4CAF50; padding: 5px 10px; border-radius: 5px;"),
        });
    }
});
