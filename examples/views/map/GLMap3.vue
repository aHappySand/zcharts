<template>
	<div class="fill">
		<LodashPlugin @loaded="handleLoaded"></LodashPlugin>
		<template v-if="!loadCount">
			<GLMap3></GLMap3>
		</template>
	</div>
</template>

<script>
	export default {
		name: "GLMap3Page",
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
