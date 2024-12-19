/**
 * Creates an anchor element and initiates a download click on it with a given URL.
 * This function is only available on the client side.
 * @param link - URL to download
 */
export const openFileLink = (link: string) => {
  if (typeof window !== "undefined") {
    const elem = document.createElement("a");
    elem.href = link;
    elem.style.display = "none"; // Hide the element
    elem.download = ""; // Suggest the browser to download instead of navigating
    document.body.appendChild(elem); // Attach to the DOM for the click to work
    elem.click();
    setTimeout(() => {
      if (document.body && elem) {
        document.body.removeChild(elem); // Clean up the element from the DOM
      }
    }, 2000);
  }
};
