import { useState, useRef, useEffect } from "react"

function formatarMoeda(valor: string) {
  let limpo = valor.replace(/[^\d.,]/g, "")
  limpo = limpo.replace(",", ".")
  const numero = parseFloat(limpo)

  if (isNaN(numero)) {
    return "R$ 0,00"
  }

  return numero.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  })
}

interface PropsValorEditavel {
  value: string
  onChange: (valor: string) => void
}

function EditableAmount({ value, onChange }: PropsValorEditavel) {
  const [editando, setEditando] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editando && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [editando])

  function aoPerderFoco() {
    onChange(formatarMoeda(value))
    setEditando(false)
  }

  function aoAlterar(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value
    if (/^[\d.,]*$/.test(val)) {
      onChange(val)
    }
  }

  return (
    <div className="w-full">
      {editando ? (
        <input
          ref={inputRef}
          type="text"
          className="w-full border-b border-gray-400 bg-transparent text-black text-3xl font-bold text-center focus:outline-none"
          value={value}
          onChange={aoAlterar}
          onBlur={aoPerderFoco}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              aoPerderFoco()
            }
          }}
          aria-label="Valor a transferir"
        />
      ) : (
        <span
          className="cursor-pointer text-3xl font-bold text-center block w-full"
          onClick={() => setEditando(true)}
          role="textbox"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              setEditando(true)
            }
          }}
          aria-label="Clique para editar o valor a transferir"
        >
          {value}
        </span>
      )}
    </div>
  )
}

export default EditableAmount
