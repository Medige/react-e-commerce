import { createContext, useEffect, useState } from "react";
// import { products } from "../assets/assets";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import axios from 'axios'

export const Shopcontext = createContext();

const Shopcontextprovider = (props) =>{

    const currency = '$';
    const delivery_fee = 10;
    const backendUrl = import.meta.env.VITE_BACKEND_URL
    const [products, setProducts] = useState([]);
    const [token, setToken] = useState('');
    const [search,setSearch] = useState('');
    const [showSearch,setShowSearch] = useState(false);
    const [cartItems, setCartItems] = useState({});
    const navigate = useNavigate();

    const addToCart = async (itemId,size) => {

        if (!size){
            toast.error('Select Product Size')
        }

        let cartData = structuredClone(cartItems);

        if (cartData[itemId]){
            if (cartData[itemId][size]){
                cartData[itemId][size] += 1;
            }
            else{
                 cartData[itemId][size] = 1;
            }
        }
        else{
             cartData[itemId] = {};
             cartData[itemId][size] = 1;
        }

        setCartItems(cartData);

        if(token){
            try {
                
                 await axios.post(backendUrl + '/api/cart/add',{itemId,size}, {headers:{token}})

            } catch (error) {
                console.log(error)
                toast.error(error.message)
                
            }
        }

    }

    const getCartCount = () => {

        let totalCount = 0;
        for( const items in cartItems){ // get items
            for(const item in cartItems[items]){  // get 'item size'
                try {

                    if (cartItems[items][item] > 0){
                        totalCount += cartItems[items][item];
                        

                    if (!item){
                        totalCount = 0  
                    }
                }

                } catch (error) {
                    
                }
            }
        }
        return totalCount;
    }

    const updateQuantity = async (itemId,size,quantity) => {

        let cartData = structuredClone(cartItems);

        cartData[itemId][size] = quantity;

        setCartItems(cartData);

        if(token){
            try {
                
                await axios.post(backendUrl + '/api/cart/update',{itemId,size,quantity},{headers:{token}})

            } catch (error) {

                console.log(error)
                toast.error(error.message)
                
            }
        }
    }

    const getCartAmount =  () => {

        let totalAmount = 0;

        for( const items in cartItems){
            let iteminfo = products.find((product) => product._id === items);
            for(const item in cartItems[items]){
                try {
                    
                    if (cartItems[items][item] > 0) {
                        totalAmount += iteminfo.price * cartItems[items][item];
                        
                    }

                } catch (error) {
                    
                }
            }
        }
        return totalAmount;
    }


    const getProductData = async () => {

        try {
            
            const response = await axios.get(backendUrl + '/api/product/list')
            if(response.data.success){
                setProducts(response.data.products)
            }
            else{
                toast.error(response.data.message)
            }
         
        } catch (error) {
            console.log(error)
            toast.error(error.message)
            
        }
    }

    const getUserCart = async( token ) => {
        try {
            
            const response = await axios.post(backendUrl + '/api/cart/get',{},{headers:{token}})
            if(response.data.success){
                setCartItems(response.data.cartData)
            }

        } catch (error) {

            console.log(error)
            toast.error(error.message)
            
        }
    }

    useEffect(() => {
        getProductData();
    },[])

    useEffect(() => {
        if(!token && localStorage.getItem('token')){
            setToken(localStorage.getItem('token'))
            getUserCart(localStorage.getItem('token'))
        }

    },[])
    

    const value= {
        products, currency, delivery_fee,
        search,setSearch,showSearch,setShowSearch,
        cartItems,addToCart,
        getCartCount,setCartItems,
        updateQuantity,
        getCartAmount,
        navigate,
        backendUrl,
        token,setToken,
    }

    return (
        <Shopcontext.Provider value={value}>
            {props.children}
        </Shopcontext.Provider>
    )
        
    
}
export default Shopcontextprovider;