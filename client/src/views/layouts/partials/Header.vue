<template>
	<nav id="header-top">
		<v-app-bar		
		app
		>
			<div v-if="!isMobile()">
			 	<v-app-bar-nav-icon @click.stop="mini = !mini" ></v-app-bar-nav-icon>
			</div>
			<div v-else>
				<v-app-bar-nav-icon @click.stop="drawer = !drawer" ></v-app-bar-nav-icon>
			</div>
		  	<v-spacer></v-spacer>

			<div style="width: 60px;">
				<email-header></email-header>
			</div>

			<div style="width: 60px;">
				<notify-header></notify-header>
			</div>

			<v-menu
		  	transition="slide-y-transition"
		  	>
		  		<template v-slot:activator="{ on: activeMenu }" >
		  			<v-avatar v-on="activeMenu">
		  				<img  src="https://cdn.vuetifyjs.com/images/john.jpg" alt="Avatar">
		  			</v-avatar>
		  		</template>
		  		<v-list >
		  			<v-list-item v-for="(item, index) in menuInfo" :to="item.link" :key="index">
		  				<v-list-item-icon>
		  					<v-icon>{{item.icon}}</v-icon>
		  				</v-list-item-icon>
		  				<v-list-item-content>
		  					<v-list-item-title>{{item.title}}</v-list-item-title>
		  				</v-list-item-content>
		  			</v-list-item>
		  		</v-list>
		  	</v-menu>

		</v-app-bar>
		<navigation v-bind:mini="mini" v-bind:drawer="drawer"></navigation>
	</nav>
</template>

<style type="text/css">
.v-avatar, .v-badge{
	cursor: pointer;

}
</style>

<script>

import NavigationDrawer from './Sidebar'
import NotifyHeaderMenu from '@/views/components/NotifyHeaderMenu'
import EmailHeaderMenu from '@/views/components/EmailHeaderMenu'

export default {
	components: {
		'navigation': NavigationDrawer,
		'notify-header': NotifyHeaderMenu,
		'email-header': EmailHeaderMenu
	},

	data (){
		return {
			mini: false,
			drawer: false,
			menuInfo: [
				{title: 'Profile', icon: 'mdi-account-circle', link: '/user/profile'},
				{title: 'My Course', icon: 'mdi-folder-multiple', link: 'user/notify'},
				{title: 'Logout', icon: 'mdi-login-variant', link: '/auth/logout'},
			],
			userInfo: this.$cookies.get('dataUser'),
			
		}
	},

	mounted(){

	},

	watch: {
		visible(val){
			console.log(val)
		}
	},

	methods: {
		isMobile() {
            if( screen.width <= 768 ) {
                return true
            }
            else {
            	this.drawer = true
                return false
            }
        }
    },
   	
   	computed: {

   	}

}
</script>