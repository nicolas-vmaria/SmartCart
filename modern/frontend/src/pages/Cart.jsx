import { useState } from "react"

function CartItem() {

    const valor = 232

    const src = false

    const [cont, setCont] = useState(1)

    const minusCont = () => {
        if (cont === 1){
            cont = 1
        } else {
            setCont(cont - 1)
        }
        
    }

    const plusCont = () => {
        setCont(cont + 1)
    }

    return (
        <div className="flex bg-gray-100 p-10 shadow-2xl  rounded-2xl">
            {src ?
                <img className="w-40 h-40 rounded-2xl border-0 outline-none border-gray-100 bg-white" src="" alt="" />
                : <div className="w-40 h-40 rounded-2xl border-2 border-gray-200 bg-white flex justify-center items-center font-black"> Sem Imagem </div>
            }
            <div className="flex w-full items-center justify-between">
                <div className="flex flex-col justify-center gap-5 ml-5">

                    <h1 className="text-2xl font-bold">Título</h1>

                    <p className="text-gray-500">SKU: 0000</p>

                </div>

                <div className="">
                    <h1 className="font-bold text-xl">R${valor * cont}</h1>
                </div>

                <div className="flex text-xl">
                    <button onClick={minusCont} className="flex justify-center items-center bg-white w-8 border-1 rounded-l-2xl border-r-0 border-gray-200 cursor-pointer hover:bg-gray-100">-</button>
                    <div className="flex justify-center items-center bg-white w-8 border-1 border-gray-200">{cont}</div>
                    <button onClick={plusCont} className="flex justify-center items-center bg-white w-8 border-1 rounded-r-2xl border-l-0 border-gray-200 cursor-pointer hover:bg-gray-100">+</button>
                </div>

                <div className=" text-xl text-black cursor-pointer select-none transition-all hover:scale-130 ">
                    X
                </div>
            </div>
        </div>
    )
}

export default function Cart() {

    

    return (
        <main className='min-h-screen w-full flex justify-center gap-20 p-10'>



            <section className="flex flex-col w-[70%]">

                <h1 className="text-4xl py-5 self-start font-bold">Carrinho</h1>
                <CartItem />



            </section>

            <section className="flex items-start mt-20 w-[20%]">
                <div className="bg-gray-100 shadow-2xl p-5 rounded-2xl w-full ">
                    <h1 className="text-2xl font-bold">Resumo do pedido</h1>

                    <input type="text" placeholder="Insira o código do cupom:" className="bg-white border-1 p-5 border-gray-200 rounded-xl w-full mt-3 h-10" />

                    <div className="flex flex-col gap-1  my-5">

                        <div className="flex justify-between">
                            <h1 className="font-bold">Subtotal:</h1>
                            <h1>R$500</h1>
                        </div>
                        <div className="flex justify-between">
                            <h1 className="font-bold">Desconto:</h1>
                            <h1>R$20</h1>
                        </div>
                        <div className="flex justify-between">
                            <h1 className="font-bold">Taxa de Entrega:</h1>
                            <h1>R$20</h1>
                        </div>
                    </div>

                    <hr />

                    <div className="flex justify-between my-5 ">
                        <h1 className="font-bold">Total:</h1>
                        <h1>R$520</h1>
                    </div>


                    <button className="bg-verde-escuro text-white h-12 w-full rounded-xl transition-all hover:-translate-y-2 hover:shadow-xl active:translate-y-0 active:bg-verde-claro cursor-pointer">Checkout</button>
                </div>
            </section>
        </main>
    )
}