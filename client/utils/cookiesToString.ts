export const cookiesTostring = (cookies: { [key: string]: string }) => {
  console.log({cookies})
  let cookieStr = '';
  for (let key in cookies) {
    cookieStr += `${key}=${cookies[key]};`;
  }
  return cookieStr;
};
