<template>
  <vue-dropzone
    ref="myVueDropzone"
    id="upload"
    :options="dropzoneOptions"
    @vdropzone-drag-drop="remove"
    @vdropzone-complete="complete"
    :useCustomSlot="true"
  >
    <div class="dropzone-custom-content">
      <h3 class="dropzone-custom-title">Drag and drop to upload content!</h3>
      <v-icon>mdi-cloud-upload</v-icon>
    </div>
  </vue-dropzone>
</template>

<script>
import vue2Dropzone from "vue2-dropzone";
import "vue2-dropzone/dist/vue2Dropzone.min.css";
export default {
  name: "uploadFile",
  props: ["image"],

  components: {
    vueDropzone: vue2Dropzone
  },

  data: function() {
    return {
      dropzoneOptions: {
        url: "https://httpbin.org/post",
        thumbnailWidth: 150,
        maxFilesize: 0.5,
        headers: { "My-Awesome-Header": "header value" }
      }
    };
  },

  mounted() {},

  methods: {
    complete(file) {
      this.$emit("update:image", file);
    },
    remove() {}
  },

  computed: {
    getImage: {
      get() {
        return this.image;
      },

      set(value) {
        this.image = value;
      }
    }
  }
};
</script>
