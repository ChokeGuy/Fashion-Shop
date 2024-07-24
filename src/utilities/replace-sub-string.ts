function replaceSubstring(
  string1: string,
  string2: string,
  replacement: string
) {
  let lowerString1 = string1.toLowerCase();
  let lowerString2 = string2.toLowerCase();

  let words = lowerString2.split(" ");
  let substringToReplace = words.filter((word) => lowerString1.includes(word));
  let result =
    substringToReplace.length > 0
      ? string1.replace(
          new RegExp(substringToReplace.join(" "), "gi"),
          replacement
        )
      : string1;

  return result;
}

export { replaceSubstring };
