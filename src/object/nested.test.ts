import { describe, expect, test } from "vitest";
import { findObjectByKeyValues, findObjectPath, getNestedValue, setNestedValue } from "./nested";

describe("getNestedValue", () => {
  const testObj = {
    user: {
      name: "John",
      contacts: [
        { email: "john@example.com", phone: "123-456" },
        { email: "john.alt@example.com", phone: "789-012" },
      ],
      settings: {
        notifications: {
          email: true,
          push: false,
        },
      },
    },
    meta: {
      created: "2023-01-01",
      tags: ["important", "user"],
    },
  };

  test("should get simple property values", () => {
    expect(getNestedValue("user.name", testObj)).toBe("John");
    expect(getNestedValue("meta.created", testObj)).toBe("2023-01-01");
  });

  test("should get nested property values", () => {
    expect(getNestedValue("user.settings.notifications.email", testObj)).toBe(
      true
    );
    expect(getNestedValue("user.settings.notifications.push", testObj)).toBe(
      false
    );
  });

  test("should handle array indexing", () => {
    expect(getNestedValue("user.contacts[0].email", testObj)).toBe(
      "john@example.com"
    );
    expect(getNestedValue("user.contacts[1].phone", testObj)).toBe("789-012");
    expect(getNestedValue("meta.tags[0]", testObj)).toBe("important");
  });

  test("should handle invalid paths", () => {
    expect(getNestedValue("user.invalid.path", testObj)).toBeUndefined();
    expect(getNestedValue("invalid", testObj)).toBeUndefined();
    expect(getNestedValue("user.contacts[5].email", testObj)).toBeUndefined();
  });

  test("should handle empty or invalid inputs", () => {
    expect(getNestedValue("", testObj)).toBeUndefined();
    expect(getNestedValue("user.contacts.[]", testObj)).toBeUndefined();
    expect(getNestedValue("user..name", testObj)).toBeUndefined();
  });
});

describe("setNestedValue", () => {
  test("should set simple property values", () => {
    const obj = { user: { name: "John" } };
    setNestedValue("user.name", "Jane", obj);
    expect(obj.user.name).toBe("Jane");
  });

  test("should create missing objects", () => {
    const obj = {};
    setNestedValue("user.settings.theme", "dark", obj);
    expect(obj).toEqual({
      user: {
        settings: {
          theme: "dark",
        },
      },
    });
  });

  test("should handle array indexing and creation", () => {
    const obj = { users: [] };
    setNestedValue("users[0].name", "John", obj);
    setNestedValue("users[1].name", "Jane", obj);
    expect(obj).toEqual({
      users: [{ name: "John" }, { name: "Jane" }],
    });
  });

  test("should handle mixed object and array paths", () => {
    const obj = {};
    setNestedValue("company.departments[0].employees[0].name", "John", obj);
    expect(obj).toEqual({
      company: {
        departments: [
          {
            employees: [{ name: "John" }],
          },
        ],
      },
    });
  });

  test("should modify existing nested arrays", () => {
    const obj = {
      users: [{ contacts: [{ email: "old@example.com" }] }],
    };
    setNestedValue("users[0].contacts[0].email", "new@example.com", obj);
    expect(obj.users[0].contacts[0].email).toBe("new@example.com");
  });

  test("should handle complex nested structures", () => {
    const obj = {};
    setNestedValue("a.b[0].c.d[1].e", "value", obj);
    expect(obj).toEqual({
      a: {
        b: [
          {
            c: {
              d: [undefined, { e: "value" }],
            },
          },
        ],
      },
    });
  });

  test("should override existing values with different types", () => {
    const obj = {
      data: "string",
    };
    setNestedValue("data.nested", "value", obj);
    expect(obj.data).toEqual({ nested: "value" });
  });

  test("should return the modified object", () => {
    const obj = {};
    const result = setNestedValue("a.b.c", "value", obj);
    expect(result).toBe(obj);
    expect(result).toEqual({
      a: {
        b: {
          c: "value",
        },
      },
    });
  });

  test("should handle numeric array indices properly", () => {
    const obj = {};
    setNestedValue("items[0]", "first", obj);
    setNestedValue("items[2]", "third", obj);
    expect(obj).toEqual({
      items: ["first", undefined, "third"],
    });
  });

  test("should handle edge cases", () => {
    const obj: any = {};

    // Empty path segments
    setNestedValue("a..b", "value", obj);
    expect(obj.a.b).toBe("value");

    // Numeric property names
    setNestedValue("prop.0.value", "test", obj);
    expect(obj.prop["0"].value).toBe("test");

    // Setting value on existing array
    obj.list = [];
    setNestedValue("list[0]", "item", obj);
    expect(obj.list[0]).toBe("item");
  });
});



describe("findObjectPath", () => {
  const testObj = {
    user: {
      name: "John",
      id: 1,
      contacts: [
        { id: 101, email: "john@example.com", phone: "123-456" },
        { id: 102, email: "john.alt@example.com", phone: "789-012" },
      ],
      settings: {
        id: 201,
        notifications: {
          email: true,
          push: false,
        },
      },
    },
    meta: {
      created: "2023-01-01",
      tags: ["important", "user"],
    },
    items: [
      { id: 1, name: "Item 1" },
      { id: 2, name: "Item 2" },
      { id: 1, name: "Item 3" }, // Duplicate ID
    ],
    config: {
      defaultUser: { id: 1 }
    }
  };

  test("should find simple property matches", () => {
    const paths = findObjectPath(testObj, { id: 1 });
    expect(paths).toContain("user");
    expect(paths).toContain("items[0]");
    expect(paths).toContain("items[2]");
    expect(paths).toContain("config.defaultUser");
  });

  test("should find nested property matches", () => {
    const paths = findObjectPath(testObj, { email: true });
    expect(paths).toContain("user.settings.notifications");
  });

  test("should find matches in arrays", () => {
    const paths = findObjectPath(testObj, { id: 101 });
    expect(paths).toContain("user.contacts[0]");
    
    const paths2 = findObjectPath(testObj, { id: 102 });
    expect(paths2).toContain("user.contacts[1]");
  });

  test("should find matches with multiple criteria", () => {
    const paths = findObjectPath(testObj, { id: 1, name: "Item 1" });
    expect(paths).toContain("items[0]");
    expect(paths).not.toContain("items[2]"); // Has id: 1 but different name
    expect(paths).not.toContain("user"); // Has id: 1 but no name property
  });

  test("should return empty array for no matches", () => {
    const paths = findObjectPath(testObj, { id: 999 });
    expect(paths).toEqual([]);
  });

  test("should handle empty criteria", () => {
    const paths = findObjectPath(testObj, {});
    expect(paths).toEqual([]);
  });

  test("should handle null or undefined input", () => {
    expect(findObjectPath(null, { id: 1 })).toEqual([]);
    expect(findObjectPath(undefined, { id: 1 })).toEqual([]);
    expect(findObjectPath(testObj, null)).toEqual([]);
    expect(findObjectPath(testObj, undefined)).toEqual([]);
  });

  test("should work with setNestedValue", () => {
    const obj = { ...testObj }; // Clone to avoid modifying test object
    const paths = findObjectPath(obj, { id: 101 });
    expect(paths.length).toBeGreaterThan(0);
    
    const path = paths[0];
    const originalValue = getNestedValue(path, obj);
    const updatedValue = { ...originalValue, email: "updated@example.com" };
    
    setNestedValue(path, updatedValue, obj);
    expect(getNestedValue(`${path}.email`, obj)).toBe("updated@example.com");
  });

  test("should find path to primitive array values", () => {
    const paths = findObjectPath(testObj, { 0: "important" });
    expect(paths).toContain("meta.tags");
  });
});

// Only add these tests if you're implementing the advanced version
describe("findObjectByKeyValues", () => {
  const testObj = {
    user: {
      name: "John",
      id: 1,
      contacts: [
        { id: 101, email: "john@example.com", phone: "123-456" },
        { id: 102, email: "JOHN.alt@example.com", phone: "789-012" },
      ],
    },
    items: [
      { id: 1, name: "Item 1", status: "active" },
      { id: 2, name: "Item 2", status: "inactive" },
      { id: 3, name: "Item 3", status: "active" },
    ],
  };

  test("should handle partial matches", () => {
    const paths = findObjectByKeyValues(testObj, { id: 1, name: "Unknown" }, { partialMatch: true });
    expect(paths).toContain("user");
    expect(paths).toContain("items[0]");
  });

  test("should handle maxDepth option", () => {
    // Should not find matches beyond depth 1
    const paths = findObjectByKeyValues(testObj, { id: 101 }, { maxDepth: 1 });
    expect(paths).toEqual([]);

    // Should not find matches at depth 2
    const paths2 = findObjectByKeyValues(testObj, { id: 101 }, { maxDepth: 3 });
    expect(paths2).toContain("user.contacts[0]");
  });

  test("should handle returnFirstMatch option", () => {
    // Should return only the first match
    const paths = findObjectByKeyValues(testObj, { status: "active" }, { returnFirstMatch: true });
    expect(paths.length).toBe(1);
    expect(paths[0]).toBe("items[0]");
  });

  test("should handle case insensitive matching", () => {
    // Should match regardless of case
    const paths = findObjectByKeyValues(testObj, { email: "john.alt@example.com" }, { caseSensitive: false });
    expect(paths).toContain("user.contacts[1]");
  });

  test("should use custom comparison function", () => {
    // Custom comparator that checks if string contains substring
    const customCompare = (a: any, b: any) => {
      if (typeof a === 'string' && typeof b === 'string') {
        return a.includes(b);
      }
      return a === b;
    };
    
    const paths = findObjectByKeyValues(testObj, { email: "@example" }, { customCompare });
    expect(paths).toContain("user.contacts[0]");
    expect(paths).toContain("user.contacts[1]");
  });

  test("should combine multiple options", () => {
    const paths = findObjectByKeyValues(
      testObj,
      { id: 1, status: "active" },
      {
        partialMatch: true,
        maxDepth: 2,
        returnFirstMatch: true
      }
    );
    
    expect(paths.length).toBe(1);
    // Either user or items[0] could be returned since we're stopping at first match
    expect(paths[0] === "user" || paths[0] === "items[0]").toBeTruthy();
  });
});