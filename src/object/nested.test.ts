import { describe, expect, test } from "vitest";
import { getNestedValue, setNestedValue } from "./nested";

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
