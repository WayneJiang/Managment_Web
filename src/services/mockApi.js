// 模擬數據
const mockUsers = [
    { id: 1, socialId: 'line123', name: '王教練', type: 'coach' },
    { id: 101, socialId: 'line456', name: '李小明', type: 'student' },
]

const mockStudents = [
    {
        id: 101,
        name: '李小明',
        gender: '男',
        age: 25,
        phone: '0912-345-678',
        height: 175,
        weight: 70,
        coach: '王教練',
        remainingClasses: 8
    },
    {
        id: 102,
        name: '張小華',
        gender: '女',
        age: 28,
        phone: '0923-456-789',
        height: 165,
        weight: 55,
        coach: '王教練',
        remainingClasses: 5
    },
    {
        id: 103,
        name: '陳大明',
        gender: '男',
        age: 32,
        phone: '0934-567-890',
        height: 180,
        weight: 85,
        coach: '王教練',
        remainingClasses: 12
    }
]

const mockCheckIns = {
    101: [
        { date: '2023-06-01', time: '18:30' },
        { date: '2023-06-05', time: '19:00' },
        { date: '2023-06-08', time: '20:00' }
    ],
    102: [
        { date: '2023-06-02', time: '10:30' },
        { date: '2023-06-06', time: '11:00' }
    ],
    103: [
        { date: '2023-06-03', time: '14:00' },
        { date: '2023-06-07', time: '15:30' },
        { date: '2023-06-10', time: '16:00' },
        { date: '2023-06-15', time: '14:30' }
    ]
}

// 模擬API函數
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

export const api = {
    // 根據社交ID獲取用戶
    async getUserBySocialId(socialId) {
        await delay(800) // 模擬網絡延遲
        const user = mockUsers.find(u => u.socialId === socialId)
        if (!user) {
            throw new Error('找不到用戶')
        }
        return user
    },

    // 獲取所有學生
    async getAllStudents() {
        await delay(800)
        return [...mockStudents]
    },

    // 根據ID獲取學生
    async getStudentById(id) {
        await delay(500)
        const idNum = parseInt(id, 10)
        const student = mockStudents.find(s => s.id === idNum)
        if (!student) {
            throw new Error('找不到學生')
        }
        return { ...student }
    },

    // 獲取學生簽到歷史
    async getStudentCheckIns(id) {
        await delay(500)
        const idNum = parseInt(id, 10)
        const checkIns = mockCheckIns[idNum] || []
        return [...checkIns]
    },

    // 更新學生信息
    async updateStudent(studentData) {
        await delay(1000)
        const idNum = parseInt(studentData.id, 10)
        const index = mockStudents.findIndex(s => s.id === idNum)

        if (index === -1) {
            throw new Error('找不到學生')
        }

        // 更新學生數據
        mockStudents[index] = { ...studentData }
        return { ...mockStudents[index] }
    }
} 