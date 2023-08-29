<template>
	<div class="fill">
		<LodashPlugin @loaded="handleLoaded"></LodashPlugin>
		<template v-if="!loadCount">
			<ThreeMap1></ThreeMap1>
		</template>
	</div>
</template>

<script>
	export default {
		name: "ThreeMap1Page",
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
