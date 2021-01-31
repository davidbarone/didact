
function foo() {
    return 1
}

test("Dummy test", () => {
    expect(foo()).toEqual(1);
});