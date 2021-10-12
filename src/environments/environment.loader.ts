export const environmentLoader = new Promise<any>((resolve, reject) => {
  const request = new XMLHttpRequest();
  request.open('GET', `./config/environment.json?_=${new Date().getTime()}`);
  request.onload = () => {
    let patch = {};
    if (request.status === 200) {
      try {
        patch = JSON.parse(request.responseText);
      } catch (exception) {}
    }
    resolve(patch);
  };
  request.send();
});
