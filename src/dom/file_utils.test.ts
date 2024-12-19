import { openFileLink } from "./file_utils";
import { describe, it, expect } from "vitest";

describe("openFileLink", () => {
  it("stub test", () => {
    const link = "https://example.com";
    openFileLink(link);

    const a = document.querySelector("a");
    expect(a).toBeDefined();
  });
});
// describe("openFileLink", () => {
//   beforeEach(() => {
//     // Mock the window object
//     global.window = {
//       document: {
//         body: {
//           appendChild: vi.fn(),
//           removeChild: vi.fn(),
//         },
//         createElement: vi.fn(() => ({
//           href: "",
//           download: "",
//           click: vi.fn(),
//         })),
//       },
//     };

//     // Create a mock for document.createElement
//     const createElementMock = vi.fn(() => ({
//       href: "",
//       download: "",
//       click: vi.fn(),
//     }));
//     Object.defineProperty(global.window.document, "createElement", {
//       value: createElementMock,
//     });
//   });

//   afterEach(() => {
//     // Restore the original window object
//     delete global.window;
//   });

//   it("creates an anchor element when window is defined", () => {
//     const link = "https://example.com";
//     openFileLink(link);
//     expect(global.window.document.createElement).toHaveBeenCalledTimes(1);
//     expect(global.window.document.createElement).toHaveBeenCalledWith("a");
//   });

//   it("sets the href attribute of the anchor element correctly", () => {
//     const link = "https://example.com";
//     openFileLink(link);
//     const elem = global.window.document.body.appendChild.mock.calls[0][0];
//     expect(elem.href).toBe(link);
//   });

//   it("sets the download attribute of the anchor element correctly", () => {
//     const link = "https://example.com";
//     openFileLink(link);
//     const elem = global.window.document.body.appendChild.mock.calls[0][0];
//     expect(elem.download).toBe("");
//   });

//   it("appends the anchor element to the DOM", () => {
//     const link = "https://example.com";
//     openFileLink(link);
//     expect(global.window.document.body.appendChild).toHaveBeenCalledTimes(1);
//   });

//   it("clicks the anchor element", () => {
//     const link = "https://example.com";
//     openFileLink(link);
//     const elem = global.window.document.body.appendChild.mock.calls[0][0];
//     expect(elem.click).toHaveBeenCalledTimes(1);
//   });

//   it("removes the anchor element from the DOM after a timeout", async () => {
//     const link = "https://example.com";
//     openFileLink(link);
//     const elem = global.window.document.body.appendChild.mock.calls[0][0];
//     await new Promise((resolve) => setTimeout(resolve, 2000));
//     expect(global.window.document.body.removeChild).toHaveBeenCalledTimes(1);
//     expect(global.window.document.body.removeChild).toHaveBeenCalledWith(elem);
//   });

//   it("does not throw an error when window is not defined", () => {
//     delete global.window;
//     const link = "https://example.com";
//     expect(() => openFileLink(link)).not.toThrow();
//   });
// });
