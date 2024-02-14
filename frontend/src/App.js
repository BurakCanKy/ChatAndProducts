import React, { useState, useEffect } from 'react';
import axios from 'axios';
import io from 'socket.io-client'
import './App.css'
const socket = io.connect("http://localhost:3000")

function App() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [newProduct, setNewProduct] = useState({ id: '', name: '', catId: '' });
  const [newCategory, setNewCategory] = useState({ id: '', name: '' });
  const [message, setMessage] = useState('');
  const [sender, setSender] = useState('');
  const [output, setOutput] = useState([]);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    socket.on('chat', data => {
      if (data.sender !== sender) {
        setFeedback('');
      }
      setOutput(prevOutput => [...prevOutput, <p key={prevOutput.length}><strong>{data.sender}:</strong> {data.message}</p>]);
    });

    socket.on('typing', data => {
      setFeedback(<p>{data} yazıyor...</p>);
    });

    return () => {
      socket.off('chat');
      socket.off('typing');
    };
  }, [sender]);

  const handleSubmit = () => {
    socket.emit('chat', {
      message: message,
      sender: sender
    });
    setMessage('');
  };

  const handleTyping = () => {
    socket.emit('typing', sender);
  };

  const fetchProducts = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/products');
      setProducts(response.data);
    } catch (error) {
      console.error('Ürünleri getirirken bir hata oluştu:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Kategorileri getirirken bir hata oluştu:', error);
    }
  };

  const handleProductAdd = async () => {
    try {
      await axios.post('http://localhost:3000/api/products', newProduct);
      setNewProduct({ id: '', name: '',catId:''});
      fetchProducts();
    } catch (error) {
      console.error('Ürün eklenirken bir hata oluştu:', error);
    }
  };

  const handleCategoryAdd = async () => {
    try {
      await axios.post('http://localhost:3000/api/categories', newCategory);
      setNewCategory({ id: '', name: '' });
      fetchCategories();
    } catch (error) {
      console.error('Kategori eklenirken bir hata oluştu:', error);
    }
  };

  const handleProductDelete = async () => {
    try {
      await axios.delete(`http://localhost:3000/api/products/${newProduct.id}`);
      setNewProduct({ id: '', name: '', catId: ''  });
      fetchProducts();
    } catch (error) {
      console.error('Ürün silinirken bir hata oluştu:', error);
    }
  };

  const handleCategoryDelete = async () => {
    try {
      await axios.delete(`http://localhost:3000/api/categories/${newCategory.id}`);
      setNewCategory({ id: '', name: '' });
      fetchCategories();
    } catch (error) {
      console.error('Kategori silinirken bir hata oluştu:', error);
    }
  };

  const handleCategoryUpdate = async () => {

    try {
      await axios.put(`http://localhost:3000/api/categories/${newCategory.id}`, newCategory);
      setNewCategory({ id: '', name: '' });
      fetchCategories();
    } catch (error) {
      console.error('Ürün güncellenirken bir hata oluştu:', error);
    }
  };

  const handleProductUpdate=async()=>{
    try{
      await axios.put(`http://localhost:3000/api/products/${newProduct.id}`,newProduct);
      setNewProduct({id:'',name:'', catId: '' });
      fetchProducts();
    }
    catch(error){
      console.error("Ürün güncellenemedi",error);
    }
  }

  return (
    <div>
      <div>

      <div id="chat-wrap" >
      <h2 style={{textAlign:'center',fontSize:'3rem'}}>Chat</h2>

        <div id="chat-window">
          {output}
          <div id="feedback">{feedback}</div>
        </div>
        <div className='chatBottom'>
        <input className='input' type="text" value={sender} onChange={(e) => setSender(e.target.value)} placeholder="Ad" />
        <input className='input' type="text" value={message} onChange={(e) => setMessage(e.target.value)} onKeyPress={handleTyping} placeholder="Mesaj" />
        <button className='submitButton' onClick={handleSubmit}>Gönder</button>
        </div>
      </div>
    </div>
    <div className='productContainer'>
      <h1 className='productHeader'>Ürünler</h1>
      <ul >
        {products.sort((a,b) => a.id - b.id).map((product) => (
          <li key={product.id}>
            {product.id}{" =) "}
            <u><i>{product.name}</i></u>{' '}
            {" =) "}{categories.find(cat => cat.id === product.catId)?.name}
          </li>
        ))}
      </ul>
      </div>
      <div className='productContainer'>
      <h1>Kategoriler</h1>
      <ul>
        {categories.sort((a,b) => a.id - b.id).map((category) => (
          <li key={category.id}>
            {category.id}{" - "}
            {category.name}{' '}
          </li>
        ))}
      </ul>
      </div>
      <div className='productSend'> 
      <h2>Ürün İşlemleri</h2>
      <input
        type="text"
        placeholder="ID"
        value={newProduct.id}
        onChange={(e) => setNewProduct({ ...newProduct, id: e.target.value })}
      />
      <input
        type="text"
        placeholder="Name"
        value={newProduct.name}
        onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
      />
      <select
        value={newProduct.catId}
        onChange={(e)=>setNewProduct({...newProduct,catId:e.target.value})}>

          <option value={""}>Kategori Seçin</option>
          {categories.sort((a,b) => a.id - b.id).map((cat)=>(
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}

      </select>
      <div style={{marginTop:'15px'}}>
      <button style={{marginRight:'6px'}} onClick={() => handleProductAdd()}>Ekle</button>
      <button style={{marginRight:'6px',backgroundColor:'rgb(255, 194, 61)'}} onClick={() => handleProductUpdate()}>Güncelle</button>
      <button style={{marginRight:'6px',backgroundColor:'rgb(150, 10, 10)'}} onClick={() => handleProductDelete()}>Sil</button>
      </div>
</div>
<div className='productSend'>

      <h2>Kategori İşlemleri</h2>
      <input
        type="text"
        placeholder="ID"
        value={newCategory.id}
        onChange={(e) => setNewCategory({ ...newCategory, id: e.target.value })}
      />
      <input
        type="text"
        placeholder="Name"
        value={newCategory.name}
        onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
      />
            <div style={{marginTop:'15px'}}>
      <button onClick={() => handleCategoryAdd()}>Ekle</button>
      <button style={{marginRight:'6px',backgroundColor:'rgb(255, 194, 61)'}} onClick={() => handleCategoryUpdate()}>Güncelle</button>
      <button style={{marginRight:'6px',backgroundColor:'rgb(150, 10, 10)'}} onClick={() => handleCategoryDelete()}>Sil</button>
      </div>
      </div>
    </div>
  );
}

export default App;
