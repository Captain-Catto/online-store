// function tạo 1 link api từ object
export const testCallApi = (filterProp: object) => {
  // tạo biến chứa url
  const url = "https://api.thecatapi.com/";
  // change object to array
  // use loop to generate url to call api
  const endPoint = Object.keys(filterProp).reduce((prev, cur, index) => {
    const stringCur = `${cur}=${filterProp[cur as keyof typeof filterProp]}`;
    // lam sao de lay gia tri key khi biet dc key cua no
    // return prev ? `${prev}&${stringCur}` : `?${stringCur}`;
    return index ? `${prev}&${stringCur}` : `?${stringCur}`;
  }, "");

  return url + endPoint;
};
