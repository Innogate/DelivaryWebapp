import{Bc as l,T as u,Za as n,f as a,zc as t}from"./chunk-PM3YHUOV.js";import{a as i,b as o}from"./chunk-EQDQRRRY.js";var c=class s{_config={preset:"Aura",primary:"emerald",surface:null,darkTheme:!1,menuMode:"static"};_state={staticMenuDesktopInactive:!1,overlayMenuActive:!1,configSidebarVisible:!1,staticMenuMobileActive:!1,menuHoverActive:!1};layoutConfig=n(this._config);layoutState=n(this._state);configUpdate=new a;overlayOpen=new a;menuSource=new a;resetSource=new a;menuSource$=this.menuSource.asObservable();resetSource$=this.resetSource.asObservable();configUpdate$=this.configUpdate.asObservable();overlayOpen$=this.overlayOpen.asObservable();theme=t(()=>this.layoutConfig()?.darkTheme?"light":"dark");isSidebarActive=t(()=>this.layoutState().overlayMenuActive||this.layoutState().staticMenuMobileActive);isDarkTheme=t(()=>this.layoutConfig().darkTheme);getPrimary=t(()=>this.layoutConfig().primary);getSurface=t(()=>this.layoutConfig().surface);isOverlay=t(()=>this.layoutConfig().menuMode==="overlay");transitionComplete=n(!1);initialized=!1;constructor(){l(()=>{this.layoutConfig()&&this.onConfigUpdate()}),l(()=>{let e=this.layoutConfig();if(!this.initialized||!e){this.initialized=!0;return}this.handleDarkModeTransition(e)})}handleDarkModeTransition(e){document.startViewTransition?this.startViewTransition(e):(this.toggleDarkMode(e),this.onTransitionEnd())}startViewTransition(e){document.startViewTransition(()=>{this.toggleDarkMode(e)}).ready.then(()=>{this.onTransitionEnd()}).catch(()=>{})}toggleDarkMode(e){(e||this.layoutConfig()).darkTheme?document.documentElement.classList.add("app-dark"):document.documentElement.classList.remove("app-dark")}onTransitionEnd(){this.transitionComplete.set(!0),setTimeout(()=>{this.transitionComplete.set(!1)})}onMenuToggle(){this.isOverlay()&&(this.layoutState.update(e=>o(i({},e),{overlayMenuActive:!this.layoutState().overlayMenuActive})),this.layoutState().overlayMenuActive&&this.overlayOpen.next(null)),this.isDesktop()?this.layoutState.update(e=>o(i({},e),{staticMenuDesktopInactive:!this.layoutState().staticMenuDesktopInactive})):(this.layoutState.update(e=>o(i({},e),{staticMenuMobileActive:!this.layoutState().staticMenuMobileActive})),this.layoutState().staticMenuMobileActive&&this.overlayOpen.next(null))}isDesktop(){return window.innerWidth>991}isMobile(){return!this.isDesktop()}onConfigUpdate(){this._config=i({},this.layoutConfig()),this.configUpdate.next(this.layoutConfig())}onMenuStateChange(e){this.menuSource.next(e)}reset(){this.resetSource.next(!0)}static \u0275fac=function(r){return new(r||s)};static \u0275prov=u({token:s,factory:s.\u0275fac,providedIn:"root"})};export{c as a};
