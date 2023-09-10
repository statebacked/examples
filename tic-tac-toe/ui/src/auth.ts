export const getUserId = (() => {
  let sub = sessionStorage.getItem("sb.sub");

  return () => {
    if (!sub) {
      sub = crypto.randomUUID();
      sessionStorage.setItem("sb.sub", sub);
    }

    return sub;
  };
})();
