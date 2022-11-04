var token;
var urn;

window.onload = () => {
  fetch("https://l15xenb90a.execute-api.us-east-1.amazonaws.com/default/GetToken").then(response => {
    return response.json();
  }).then(data => {
    token = data;
  });

  fetch("https://ieaxpcp8n6.execute-api.us-east-1.amazonaws.com/GetUrnsFromBucket")
  .then(response => {
    return response.json();
  }).then(data => {
    data.forEach(urn => {
      genCard(urn);
    });
  })
  .catch(err => {
    console.error(err);
  });
}

async function genCard(urn){
  let encodedUrn = btoa(urn);
  let thumbUrl = await getThumb(encodedUrn, token);

  document.getElementById("cards-container").insertAdjacentHTML(
    'beforeend',
    `<div class="card">
      <div class="card-body">
        <img id="thumb-${encodedUrn}" class="card-img" src="${thumbUrl}">
        <div id="qrcode-${encodedUrn}" class="card-img"></div>
        <a href="https://JoaoMartins-callmeJohn.github.io/forge-viewer-ar/viewer.html?urn=${encodedUrn}"><p class="card-text">${urn.split('/')[1]}</p></a>
      </div>
    </div>`
  );

  addQRcode(`qrcode-${encodedUrn}`, encodedUrn);

}

async function addQRcode(divId, urn){
  let element = document.getElementById(divId);
  let qrcode = new QRCode(element);
  qrcode.makeCode(`https://JoaoMartins-callmeJohn.github.io/forge-viewer-ar/viewer.html?urn=${urn}`);
}

async function getThumb(urn, token){
  let imgUrl;
  await fetch(`https://developer.api.autodesk.com/modelderivative/v2/designdata/${urn}/thumbnail`, {
    "method": "GET",
    "headers": {
      "Authorization": "Bearer " + token
    }
  })
  .then(response => {
    return response.blob();
  })
  .then(data => {
    var urlCreator = window.URL || window.webkitURL;
    var imageUrl = urlCreator.createObjectURL(data);
    imgUrl = imageUrl;
  })
  .catch(err => {
    console.error(err);
  });

  return imgUrl;
}
