<template>
	<div class="fill">
		<LodashPlugin @loaded="handleLoaded"></LodashPlugin>
		<template v-if="!loadCount">
			<GLMap2></GLMap2>
		</template>
	</div>
</template>

<script>
	export default {
		name: "GLMap2Page",
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
