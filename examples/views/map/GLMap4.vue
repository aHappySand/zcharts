<template>
	<div class="fill">
		<LodashPlugin @loaded="handleLoaded"></LodashPlugin>
		<template v-if="!loadCount">
			<GLMap4></GLMap4>
		</template>
	</div>
</template>

<script>
	export default {
		name: "GLMap4Page",
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
