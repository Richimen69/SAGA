import React, { useState } from "react";
import LogoPrincipal from "../assets/logos/LogoPrincipal.svg";
import Next from "../assets/botones/next.svg";
import LogoPrincipalBlanco from "../assets/logos/LogoPrincipalBlanco.png";
import { useNavigate } from "react-router-dom";
import fetchApi from "../shared/services/apiNew"; // Usamos tu wrapper

function Login() {
  const [user, setUser] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
  
    if (!user || !password) {
      setError("Todos los campos son obligatorios.");
      return;
    }
  
    setLoading(true);
    
    try {
      // Usamos fetchApi directo al endpoint de Django.
      // Django requiere los nombres "username" y "password"
      const response = await fetchApi('login/', {
        method: 'POST',
        body: JSON.stringify({
          username: user,
          password: password
        }),
      });
  
      // SimpleJWT devuelve el token en la variable 'access'
      if (response.access) {
        localStorage.setItem('token', response.access);
        
        // Si tu vista en Django envía datos de usuario, los guardamos también
        if (response.user) {
          localStorage.setItem('user', JSON.stringify(response.user));
        }

        navigate("/");
      } else {
        // SimpleJWT suele devolver el mensaje de error en 'detail'
        setError(response.detail || "Credenciales incorrectas.");
      }
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      setError('Hubo un problema al intentar iniciar sesión.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen bg-contain"
      style={{
        backgroundImage: `url(${LogoPrincipalBlanco})`,
        backgroundRepeat: "no-repeat",
      }}
    >
      <img src={LogoPrincipal} alt="Logo Principal" className="w-[440px]" />
      <p className="text-primary font-bold text-2xl sm:text-xl md:text-3xl lg:text-4xl">
        Iniciar sesión
      </p>
      <form onSubmit={handleLogin} className="p-5 space-y-3 flex flex-col justify-center items-center w-full">
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <div>
          <p className="p-1 text-primary font-semibold">Usuario</p>
          <input
            className="block px-6 py-3 text-base text-black bg-white border border-gray-200 rounded-[19px] appearance-none placeholder:text-gray-400 focus:border-primary focus:outline-hidden focus:ring-primary w-[300px]"
            placeholder="Ingrese su usuario"
            type="text"
            value={user}
            onChange={(e) => setUser(e.target.value)}
          />
        </div>
        <div>
          <p className="p-1 text-primary font-semibold">Contraseña</p>
          <input
            className="block px-6 py-3 text-base text-black bg-white border border-gray-200 rounded-[19px] appearance-none placeholder:text-gray-400 focus:border-primary focus:outline-hidden focus:ring-primary w-[300px]"
            placeholder="•••••••••"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="hover:opacity-60 cursor-pointer"
        >
          {loading ? "Cargando..." : <img src={Next} className="w-[47px]" />}
        </button>
      </form>
    </div>
  );
}

export default Login;