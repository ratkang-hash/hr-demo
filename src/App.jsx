import { useEffect, useState } from 'react'
import './index.css'

function App() {
  const [employees, setEmployees] = useState([])
  const [formData, setFormData] = useState({ first_name: '', last_name: '', email: '', position: '', salary: '' })
  const [editId, setEditId] = useState(null)

  const fetchEmployees = () => {
    fetch('http://localhost:3000/api/employees')
      .then(res => res.json())
      .then(data => setEmployees(data))
      .catch(err => console.error("Error:", err))
  }

  useEffect(() => { fetchEmployees() }, [])

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

  return (
    <div className="min-h-screen bg-gray-100 p-8 font-sans">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">🚀 ระบบจัดการพนักงาน (HR Pro)</h1>

        {/* --- ฟอร์มกรอกข้อมูล --- */}
        <div className={`p-6 rounded-xl shadow-lg mb-8 transition-colors duration-300 ${editId ? 'bg-yellow-50 border-2 border-yellow-400' : 'bg-white'}`}>
          <h2 className={`text-xl font-semibold mb-4 flex items-center gap-2 ${editId ? 'text-yellow-700' : 'text-gray-700'}`}>
            {editId ? '✏️ แก้ไขข้อมูลพนักงาน' : '➕ ลงทะเบียนพนักงานใหม่'}
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
              <button type="submit" className={`flex-1 py-2 px-4 rounded-lg font-bold text-white transition-all shadow-md active:scale-95 ${editId ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-green-600 hover:bg-green-700'}`}>
                {editId ? 'บันทึกการแก้ไข' : 'ยืนยันการเพิ่มข้อมูล'}
              </button>
              
              {editId && (
                <button type="button" onClick={handleCancel} className="px-6 py-2 rounded-lg bg-gray-500 text-white font-bold hover:bg-gray-600 shadow-md">
                  ยกเลิก
                </button>
              )}
            </div>
          </form>
        </div>

        {/* --- ตารางแสดงผล --- */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-indigo-600 text-white">
              <tr>
                <th className="p-4 font-semibold">ID</th>
                <th className="p-4 font-semibold">ชื่อ-นามสกุล</th>
                <th className="p-4 font-semibold">ตำแหน่ง</th>
                <th className="p-4 font-semibold text-right">เงินเดือน</th>
                <th className="p-4 font-semibold text-center">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {employees.map((emp) => (
                <tr key={emp.id} className="hover:bg-indigo-50 transition-colors">
                  <td className="p-4 text-gray-500">#{emp.id}</td>
                  <td className="p-4 font-medium text-gray-800">
                    {emp.first_name} {emp.last_name}
                    <div className="text-xs text-gray-400">{emp.email}</div>
                  </td>
                  <td className="p-4">
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {emp.position}
                    </span>
                  </td>
                  <td className="p-4 text-right font-mono text-gray-700">{Number(emp.salary).toLocaleString()}</td>
                  <td className="p-4 text-center space-x-2">
                    <button onClick={() => handleEdit(emp)} className="text-indigo-600 hover:text-indigo-900 font-medium hover:underline">แก้ไข</button>
                    <span className="text-gray-300">|</span>
                    <button onClick={() => handleDelete(emp.id)} className="text-red-500 hover:text-red-700 font-medium hover:underline">ลบ</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {employees.length === 0 && <div className="p-8 text-center text-gray-400">ยังไม่มีข้อมูลพนักงาน</div>}
        </div>
      </div>
    </div>
  )
}

export default App
