import formsg from "../src/index";

describe("FormSG SDK", () => {
  it("should be able to initialise without arguments", () => {
    expect(() => formsg()).not.toThrow();
  });
});
