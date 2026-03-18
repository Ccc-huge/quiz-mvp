import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import PracticeView from '../views/PracticeView.vue';
import WrongView from '../views/WrongView.vue';
import FavoriteView from '../views/FavoriteView.vue';
import BankView from '../views/BankView.vue';
import ModeSelectView from '../views/ModeSelectView.vue';
import TypePracticeView from '../views/TypePracticeView.vue';
import KnowledgePracticeView from '../views/KnowledgePracticeView.vue';
import UnansweredPracticeView from '../views/UnansweredPracticeView.vue';
import SpecialPracticeView from '../views/SpecialPracticeView.vue';
import SearchView from '../views/SearchView.vue';

const routes = [
  { path: '/', name: 'home', component: HomeView },
  { path: '/practice', name: 'practice', component: PracticeView },
  { path: '/wrong', name: 'wrong', component: WrongView },
  { path: '/favorite', name: 'favorite', component: FavoriteView },
  { path: '/bank', name: 'bank', component: BankView },
  { path: '/modes', name: 'modes', component: ModeSelectView },
  { path: '/modes/type', name: 'mode_type', component: TypePracticeView },
  { path: '/modes/knowledge', name: 'mode_knowledge', component: KnowledgePracticeView },
  { path: '/modes/unanswered', name: 'mode_unanswered', component: UnansweredPracticeView },
  { path: '/modes/special', name: 'mode_special', component: SpecialPracticeView },
  { path: '/search', name: 'search', component: SearchView }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
