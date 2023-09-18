# THIS IS A WORK IN PROGRESS

# aps-viewer-ar

This sample demonstrates a way to convert SVF(2) derivatives to USDZ to use on your AR workflows.

### DEMO: [https://JoaoMartins-callmeJohn.github.io/forge-viewer-ar/](https://joaomartins-callmejohn.github.io/aps-viewer-ar/)

### PREPARATION

First up, Forge-Viewer is still using V71. So we're using a pure THREE JS Viewer (r128).
We start with our SVF(2) translated models, and from there we can use [forge-convert-utils](https://github.com/petrbroz/forge-convert-utils) to convert them to GLTF ([this sample](https://github.com/petrbroz/forge-convert-utils/blob/develop/samples/remote-svf-to-gltf.js) does the job).
For simplicity, we can generate a glb from the gltf ([here's](https://gist.github.com/JoaoMartins-callmejohn/01930cd6d044d2c1a23ea932616ace7d#file-svf-to-gltf-to-glb-L39-L57) a sample for that).
And then we can upload the glb to a bucket to later be used by our application.
We could, for instance, create a lambda that converts and upload the glb to our bucket, and trigger that using a webhook through the [extraction.finished](https://aps.autodesk.com/en/docs/webhooks/v1/reference/events/extraction.finished/) event.
Follow the steps below to load them.

#### RENDERING THE MODEL

Now that we have our models (GLB) on our buckets, we can render them using lambdas.
First, we need to filter all the available GLB's at our bucket ([here's](https://gist.github.com/JoaoMartins-Callmejohn/01930cd6d044d2c1a23ea932616ace7d#file-svf-to-gltf-to-glb-L39-L57) a sample for that) and then, we can [download the selected model](https://gist.github.com/JoaoMartins-Callmejohn/4df75112e1dc3b3a68637919f10fd42a) to be rendered on client side.
The USDZExporter will take care of generating our USDZ file.
As of now, this workflow is only available natively for IOS.
