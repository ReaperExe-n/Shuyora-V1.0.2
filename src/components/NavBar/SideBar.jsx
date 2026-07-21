import React, { useEffect } from "react"
import { BsBroadcast } from "react-icons/bs"
import { FaAngleLeft, FaComments, FaLanguage, FaRandom } from "react-icons/fa"
import { Link, useNavigate } from "react-router-dom"
import { S } from "./sidebar.style"

const SideBar = ({ open, setOpen }) => {
  const navigate = useNavigate()
  const clickHandler = (e) => {
    setOpen(false)
    navigate(`/genre/${e.target.innerText.toLowerCase()}`)
  }
  return (
    <S.SideMenu open={open}>
      <S.CloseButton onClick={() => setOpen(false)}>
        <FaAngleLeft /> Close menu
      </S.CloseButton>
      <S.SettingsIcon>
        <S.SettingsItem>
          <BsBroadcast size={20} color="#a881e6" />
          <p>Watch2gether</p>
        </S.SettingsItem>
        <S.SettingsItem>
          <FaRandom size={20} color="#a881e6" />
          <p>Random</p>
        </S.SettingsItem>
        <S.SettingsItem>
          <FaLanguage size={20} color="#a881e6" />
          <p>Anime name</p>
        </S.SettingsItem>
      </S.SettingsIcon>
      <S.DonateBtn>Donate</S.DonateBtn>
      <S.CommunityBtn>
        <FaComments size={14} color="#a881e6" />
        Community
      </S.CommunityBtn>
      <S.NavList>
        <S.Item>
          <Link to="/home">Home</Link>
        </S.Item>
        <S.Item>
          <Link to="/tv-series">Subbed anime</Link>
        </S.Item>
        <S.Item>
          <Link to="/tv-series">Dubbed anime</Link>
        </S.Item>
        <S.Item>
          <Link to="/most-popular">Most popular</Link>
        </S.Item>
        <S.Item>
          <Link to="/movies">Movies</Link>
        </S.Item>
        <S.Item>
          <Link to="/tv-series">Tv Series</Link>
        </S.Item>
        <S.Item>
          <Link to="/jukebox" style={{ color: '#2ecc71', fontWeight: 'bold' }}>🎵 OP/ED Jukebox</Link>
        </S.Item>
        <S.Item>
          <Link to="/watch-party" style={{ color: '#f39c12', fontWeight: 'bold' }}>🍿 Watch Party</Link>
        </S.Item>
        <S.Item>
          <Link to="/profile" style={{ color: '#9b59b6', fontWeight: 'bold' }}>👤 My Profile</Link>
        </S.Item>
        <S.Item>
          <p style={{ marginBottom: "1em" }}>Genre</p>
          <S.GenreList>
            <S.GenreItem onClick={clickHandler}>Action</S.GenreItem>
            <S.GenreItem onClick={clickHandler}>Adventure</S.GenreItem>
            <S.GenreItem onClick={clickHandler}>Cars</S.GenreItem>
            <S.GenreItem onClick={clickHandler}>Comedy</S.GenreItem>
            <S.GenreItem onClick={clickHandler}>Dementia</S.GenreItem>
            <S.GenreItem onClick={clickHandler}>Demons</S.GenreItem>
            <S.GenreItem onClick={clickHandler}>Drama</S.GenreItem>
            <S.GenreItem onClick={clickHandler}>Ecchi</S.GenreItem>
            <S.GenreItem onClick={clickHandler}>Fantasy</S.GenreItem>
            <S.GenreItem onClick={clickHandler}>Game</S.GenreItem>
          </S.GenreList>
        </S.Item>
      </S.NavList>
    </S.SideMenu>
  )
}

export default SideBar
