<template>
  <label class="text-reader">
    <input type="file" @change="loadFile" accept="image/*">
  </label>
</template>

<script>
export default {
  methods: {
    loadFile(ev) {
       const file = ev.target.files[0];
        const reader = new FileReader()

        reader.readAsDataURL(file)

        reader.onload = e => {
            this.$emit("load", e.target.result)
        
        }
    }
  }
};
</script>