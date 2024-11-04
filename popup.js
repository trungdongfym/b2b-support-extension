document.getElementById("save").addEventListener("click", () => {
    console.log(`okokokok`);
    const domain = document.getElementById("redirectDomain").value;

    chrome.storage.sync.set({ redirectDomain: domain }, () => {
        console.log("Domain saved:", domain);
        alert("Domain saved!");
    });
});

document.addEventListener("DOMContentLoaded", () => {
    chrome.storage.sync.get("redirectDomain", (data) => {
        document.getElementById("redirectDomain").value = data.redirectDomain || "";
    });
});
