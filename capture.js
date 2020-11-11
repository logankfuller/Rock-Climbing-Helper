function readURL() {
    if (this.files && this.files[0]) {
        var reader = new FileReader();

        reader.onload = function (e) {
            document.getElementById('blah').src =  e.target.result;
        }

        reader.readAsDataURL(this.files[0]);
    }
}
const input = document.querySelector('input')
input.addEventListener('change', readURL)