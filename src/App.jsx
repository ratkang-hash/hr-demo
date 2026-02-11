import { useEffect, useState } from 'react'
import './index.css'

function App() {
  const [employees, setEmployees] = useState([])
  const [formData, setFormData] = useState({ first_name: '', last_name: '', email: '', position: '', salary: '' })
  const [editId, setEditId] = useState(null)

  // --- State สำหรับ Popup ฝึกอบรม ---
  const [showModal, setShowModal] = useState(false)
  const [selectedEmp, setSelectedEmp] = useState(null)
  const [trainingList, setTrainingList] = useState([])
  const [newCourse, setNewCourse] = useState({ course_name: '', training_date: '' })

  // --- State สำหรับค้นหา (เพิ่มใหม่) ⭐ ---
  const [searchTerm, setSearchTerm] = useState('')

  // 1. โหลดข้อมูลพนักงาน
  const fetchEmployees = () => {
    fetch('http://localhost:3000/api/employees')
      .then(res => res.json())
      .then(data => setEmployees(data))
      .catch(err => console.error("Error:", err))
  }

  // 2. โหลดประวัติฝึกอบรม
  const fetchTraining = (empId) => {
    fetch(`http://localhost:3000/api/employees/${empId}/training`)
      .then(res => res.json())
      .then(data => setTrainingList(data))
  }

  useEffect(() => { fetchEmployees() }, [])

  // --- ฟังก์ชั่นจัดการพนักงาน ---
  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value })
  
  const handleEdit = (emp) => {
    setEditId(emp.id)
    setFormData({ ...emp })
  }

  const handleCancel = () => {
    setEditId(null)
    setFormData({ first_name: '', last_name: '', email: '', position: '', salary: '' })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const method = editId ? 'PUT' : 'POST'
    const url = editId ? `http://localhost:3000/api/employees/${editId}` : 'http://localhost:3000/api/employees'

    try {
      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      if (response.ok) {
        alert(editId ? "✅ แก้ไขสำเร็จ!" : "✅ เพิ่มสำเร็จ!")
        handleCancel()
        fetchEmployees()
      }
    } catch (error) { alert("❌ ผิดพลาด") }
  }

  const handleDelete = async (id) => {
    if(!confirm("⚠️ ลบจริงนะครับ?")) return;
    try {
      const response = await fetch(`http://localhost:3000/api/employees/${id}`, { method: 'DELETE' })
      if (response.ok) fetchEmployees()
    } catch (error) { alert("❌ ลบไม่สำเร็จ") }
  }

  // --- ฟังก์ชั่นจัดการ Popup ---
  const openTrainingModal = (emp) => {
    setSelectedEmp(emp)
    fetchTraining(emp.id)
    setShowModal(true)
  }

  const closeTrainingModal = () => {
    setShowModal(false)
    setSelectedEmp(null)
    setTrainingList([])
  }

  const handleAddTraining = async (e) => {
    e.preventDefault()
    try {
      const response = await fetch(`http://localhost:3000/api/employees/${selectedEmp.id}/training`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCourse)
      })
      if (response.ok) {
        fetchTraining(selectedEmp.id)
        setNewCourse({ course_name: '', training_date: '' })
      }
    } catch (error) { alert("❌ เพิ่มรายการไม่สำเร็จ") }
  }

  // --- ฟิลเตอร์ข้อมูลตามคำค้นหา (หัวใจสำคัญ!) ⭐ ---
  const filteredEmployees = employees.filter(emp => {
    const text = searchTerm.toLowerCase()
    return (
      emp.first_name.toLowerCase().includes(text) ||
      emp.last_name.toLowerCase().includes(text) ||
      emp.position.toLowerCase().includes(text) ||
      emp.email.toLowerCase().includes(text)
    )
  })

  return (
    <div className="min-h-screen bg-gray-100 p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">🚀 ระบบจัดการพนักงาน (Full Stack + Search)</h1>

        {/* --- ฟอร์มหลัก --- */}
        <div className={`p-6 rounded-xl shadow-lg mb-8 transition-colors duration-300 ${editId ? 'bg-yellow-50 border-2 border-yellow-400' : 'bg-white'}`}>
          <h2 className={`text-xl font-semibold mb-4 ${editId ? 'text-yellow-700' : 'text-gray-700'}`}>
            {editId ? '✏️ แก้ไขข้อมูล' : '➕ ลงทะเบียนพนักงานใหม่'}
          </h2>
          <form onSubmit={handleSubmit} className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <input type="text" name="first_name" placeholder="ชื่อจริง" value={formData.first_name} onChange={handleChange} required className="input-field" />
              <input type="text" name="last_name" placeholder="นามสกุล" value={formData.last_name} onChange={handleChange} required className="input-field" />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <input type="email" name="email" placeholder="อีเมล" value={formData.email} onChange={handleChange} required className="input-field" />
              <input type="text" name="position" placeholder="ตำแหน่ง" value={formData.position} onChange={handleChange} required className="input-field" />
              <input type="number" name="salary" placeholder="เงินเดือน" value={formData.salary} onChange={handleChange} required className="input-field" />
            </div>
            <div className="flex gap-3 mt-2">
              <button type="submit" className={`flex-1 py-2 px-4 rounded-lg font-bold text-white shadow-md ${editId ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-green-600 hover:bg-green-700'}`}>
                {editId ? 'บันทึก' : 'เพิ่มข้อมูล'}
              </button>
              {editId && <button type="button" onClick={handleCancel} className="px-6 py-2 rounded-lg bg-gray-500 text-white font-bold hover:bg-gray-600">ยกเลิก</button>}
            </div>
          </form>
        </div>

        {/* --- ช่องค้นหา (Search Bar) ⭐ --- */}
        <div className="mb-4 flex justify-between items-center bg-white p-4 rounded-xl shadow-md">
          <h2 className="text-xl font-bold text-gray-700">📋 รายชื่อพนักงาน ({filteredEmployees.length} คน)</h2>
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
            <input 
              type="text" 
              placeholder="ค้นหาชื่อ, ตำแหน่ง..." 
              className="pl-10 pr-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 w-64 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* --- ตารางแสดงผล --- */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-indigo-600 text-white">
              <tr>
                <th className="p-4">ID</th>
                <th className="p-4">ชื่อ-นามสกุล</th>
                <th className="p-4">ตำแหน่ง</th>
                <th className="p-4 text-right">เงินเดือน</th>
                <th className="p-4 text-center">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredEmployees.length === 0 ? (
                <tr><td colSpan="5" className="p-8 text-center text-gray-400 text-lg">❌ ไม่พบข้อมูลที่ค้นหา</td></tr>
              ) : (
                filteredEmployees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-indigo-50 transition-colors">
                    <td className="p-4 text-gray-500">#{emp.id}</td>
                    <td className="p-4 font-medium text-gray-800">
                      {emp.first_name} {emp.last_name}
                      <div className="text-xs text-gray-400">{emp.email}</div>
                    </td>
                    <td className="p-4"><span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">{emp.position}</span></td>
                    <td className="p-4 text-right font-mono text-gray-700">{Number(emp.salary).toLocaleString()}</td>
                    <td className="p-4 text-center space-x-2">
                      <button onClick={() => openTrainingModal(emp)} className="text-sm bg-purple-100 text-purple-700 px-3 py-1 rounded hover:bg-purple-200">📜 ประวัติ</button>
                      <button onClick={() => handleEdit(emp)} className="text-sm bg-yellow-100 text-yellow-700 px-3 py-1 rounded hover:bg-yellow-200">แก้ไข</button>
                      <button onClick={() => handleDelete(emp.id)} className="text-sm bg-red-100 text-red-700 px-3 py-1 rounded hover:bg-red-200">ลบ</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- MODAL POPUP (เหมือนเดิม) --- */}
      {showModal && selectedEmp && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl overflow-hidden">
            <div className="bg-purple-600 text-white p-4 flex justify-between items-center">
              <h3 className="text-xl font-bold">📚 ประวัติการฝึกอบรม: {selectedEmp.first_name} {selectedEmp.last_name}</h3>
              <button onClick={closeTrainingModal} className="text-white hover:text-gray-200 text-2xl font-bold">&times;</button>
            </div>
            <div className="p-6">
              <form onSubmit={handleAddTraining} className="flex gap-2 mb-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
                <input type="text" placeholder="ชื่อหลักสูตร" required className="flex-1 input-field" value={newCourse.course_name} onChange={(e) => setNewCourse({...newCourse, course_name: e.target.value})} />
                <input type="date" required className="input-field w-40" value={newCourse.training_date} onChange={(e) => setNewCourse({...newCourse, training_date: e.target.value})} />
                <button type="submit" className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700">เพิ่ม</button>
              </form>
              <div className="max-h-60 overflow-y-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-100 text-gray-600 text-sm uppercase">
                    <tr><th className="p-3">หลักสูตร</th><th className="p-3">วันที่อบรม</th></tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {trainingList.length === 0 ? (
                      <tr><td colSpan="2" className="p-4 text-center text-gray-400">ยังไม่เคยผ่านการอบรม</td></tr>
                    ) : (
                      trainingList.map((t) => (
                        <tr key={t.id}>
                          <td className="p-3 font-medium text-gray-800">{t.course_name}</td>
                          <td className="p-3 text-gray-600">{new Date(t.training_date).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="bg-gray-100 p-4 text-right">
              <button onClick={closeTrainingModal} className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">ปิดหน้าต่าง</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
