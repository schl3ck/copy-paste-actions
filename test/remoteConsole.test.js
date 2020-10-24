const { expect } = require("chai");
const { customStringify } = require("../src/remoteConsole");

describe("remoteConsole", function() {
  describe("customStringify", function() {
    it("no object", function() {
      expect(customStringify("asdf"), "string").to.equal('"asdf"');
      expect(customStringify(42), "number").to.equal("42");
      expect(customStringify(true), "bool").to.equal("true");
      expect(customStringify(null), "null").to.equal("null");
    });
    it("objects, no recursion", function() {
      expect(
        customStringify({
          foo: "bar",
          a: 42,
          b: false,
          c: null,
        }),
        "simple object",
      ).to.equal('{"foo":"bar","a":42,"b":false,"c":null}');

      expect(
        customStringify({
          foo: {
            bar: 42,
          },
          bar: {
            qux: {
              42: 42,
            },
          },
        }),
        "nested object",
      ).to.equal('{"foo":{"bar":42},"bar":{"qux":{"42":42}}}');
    });
    it("arrays", function() {
      expect(
        customStringify([1, "foo", 3, false, null]),
        "simple array",
      ).to.equal('[1,"foo",3,false,null]');

      expect(
        customStringify([1, [22, 33], [123, [456]], true]),
        "nested array",
      ).to.equal("[1,[22,33],[123,[456]],true]");

      expect(
        customStringify({
          foo: [
            1234,
            {
              bar: "bar",
            },
          ],
        }),
        "object in array in object",
      ).to.equal('{"foo":[1234,{"bar":"bar"}]}');
    });
    it("same object twice", function() {
      const o = { foo: 42 };
      let oStr = '{"foo":42}';
      expect(
        customStringify({
          o: o,
          o2: o,
          o3: [o, o],
        }),
        "no recursion",
      ).to.equal(`{"o":${oStr},"o2":${oStr},"o3":[${oStr},${oStr}]}`);

      o.o = o;
      oStr = '{"foo":42,"o":"<circular ref>"}';
      expect(customStringify(o), "direct circular").to.equal(oStr);

      const o2 = { bar: 21 };
      o2.o = o;
      const o2Str = '{"bar":21,"o":"<circular ref>"}';
      o.o = o2;
      oStr = `{"foo":42,"o":${o2Str}}`;
      expect(customStringify(o), "nested circular").to.equal(oStr);
    });
    it("complex object array construct", function() {
      const o = { foo: "bar" };
      const ostr = '{"foo":"bar"}';
      const ar = [2];
      const o2 = { qux: 1, o: o, ar: ar };
      o2.o2 = o2;
      ar.push(o2);
      expect(
        customStringify({
          root: true,
          o: o,
          o2: o2,
          ar: ar,
        }),
        "complex",
      ).to.equal(
        `{"root":true,"o":${ostr},"o2":{"qux":1,"o":${ostr},"ar":[2,"<circular ref>"],"o2":"<circular ref>"},"ar":[2,{"qux":1,"o":${ostr},"ar":"<circular ref>","o2":"<circular ref>"}]}`,
      );
    });
  });
});
