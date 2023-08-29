<template>
	<div class="fill">
		<LodashPlugin @loaded="handleLoaded"></LodashPlugin>
		<template v-if="!loadCount">
			<ZMap1></ZMap1>
		</template>
	</div>
</template>

<script>
	export default {
		name: "ZMap1Page",
		data() {
			return {
				loadCount: 1,
			};
		},

		computed: {},

		methods: {
			handleLoaded() {
				this.loadCount--;
			},
		},
	}
</script>

<style scoped>

</style>
