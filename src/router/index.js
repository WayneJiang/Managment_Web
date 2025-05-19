const routes = [
    {
        path: '/',
        name: 'Home',
        component: () => import('../views/Home.vue')
    },
    {
        path: '/trainee/info/:id',
        name: 'TraineeInfo',
        component: () => import('../views/TraineeInfo.vue')
    },
    {
        path: '/coach/:id',
        name: 'CoachInfo',
        component: () => import('../views/CoachInfo.vue')
    },
    {
        path: '/plan/:id',
        name: 'TrainingPlan',
        component: () => import('../views/TrainingPlan.vue')
    }
]

export default routes 