// app/signup/ChildInput.js
export default function ChildInput({
  children,
  addChild,
  removeChild,
  updateChild,
}) {
  return (
    <div className="mb-4">
      <h3 className="text-lg font-semibold mb-2">자녀 정보</h3>
      {children.map((child, index) => (
        <div key={index} className="mb-2 p-4 bg-white rounded border relative">
          <button
            type="button"
            onClick={() => removeChild(index)}
            className="absolute top-2 right-2 text-red-500 font-bold"
          >
            ×
          </button>

          <label className="block">
            이름:
            <input
              type="text"
              className="w-full p-2 border rounded"
              value={child.name}
              onChange={(e) => updateChild(index, 'name', e.target.value)}
              required
            />
          </label>
          <label className="block mt-2">
            성별:
            <select
              className="w-full p-2 border rounded"
              value={child.gender}
              onChange={(e) => updateChild(index, 'gender', e.target.value)}
              required
            >
              <option value="">선택</option>
              <option value="male">남아</option>
              <option value="female">여아</option>
            </select>
          </label>
          <label className="block mt-2">
            생년월일:
            <input
              type="date"
              className="w-full p-2 border rounded"
              value={child.birthdate}
              onChange={(e) => updateChild(index, 'birthdate', e.target.value)}
              required
            />
          </label>
        </div>
      ))}

      <button
        type="button"
        onClick={addChild}
        className="bg-blue-500 text-white px-4 py-2 rounded mt-2 w-full"
      >
        + 자녀 추가
      </button>
    </div>
  );
}
