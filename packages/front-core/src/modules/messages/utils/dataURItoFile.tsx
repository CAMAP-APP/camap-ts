export function dataURItoBlob(dataURI: string) {
    var byteString = atob(dataURI.split(',')[1]);

    var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

    var ab = new ArrayBuffer(byteString.length);
    var ia = new Uint8Array(ab);
    for (var i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], {type: mimeString});

}

export function dataURItoFile(dataURI: string, filename: string) {
    const blob = dataURItoBlob(dataURI);
    return new File([blob], filename, { type: blob.type });
}