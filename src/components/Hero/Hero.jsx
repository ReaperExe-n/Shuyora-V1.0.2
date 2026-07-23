import React from "react";
import {
  FaCalendar,
  FaChevronLeft,
  FaChevronRight,
  FaClock,
  FaPlayCircle,
} from "react-icons/fa";
import SwiperCore, {
  Navigation,
  Pagination,
  Scrollbar,
  A11y,
  Autoplay,
} from "swiper";
import "swiper/swiper-bundle.css";
import { H } from "./hero.style";
SwiperCore.use([Navigation, Pagination, Scrollbar, A11y, Autoplay]);
import useTrendingAnime from "../../hooks/useTrendingAnime";

const Hero = () => {
  const { data, isFetched } = useTrendingAnime();

  const getTitle = (item) => item.title.english || item.title.romaji || item.title.userPreferred;

  return (
    <H.Swiper
      slidesPerView={1}
      pagination={{
        clickable: true,
      }}
      direction="horizontal"
      loop={true}
      autoplay={{ delay: 3000 }}
      modules={[Pagination]}
      className="swiper"
      navigation={{
        nextEl: ".btn-next",
        prevEl: ".btn-prev",
      }}
    >
      {isFetched &&
        data.map((item, idx) => (
          <H.Slides key={item.id}>
            <H.ImgContainer>
              <H.Img src={item.bannerImage || item.coverImage.extraLarge} />
            </H.ImgContainer>
            <H.Content>
              <H.Rank>
                <p>#{idx + 1} Spotlight</p>
              </H.Rank>
              <H.Title>{getTitle(item)}</H.Title>
              <H.Icons>
                <H.Icon>
                  <FaPlayCircle size={12} />
                  {item.format || "TV"}
                </H.Icon>
                {item.duration && (
                  <H.Icon>
                    <FaClock size={12} /> {item.duration}m
                  </H.Icon>
                )}
                {item.startDate?.year && (
                  <H.Icon>
                    <FaCalendar size={12} />
                    {item.startDate.year}
                  </H.Icon>
                )}
                <H.IconSpan>HD</H.IconSpan>
              </H.Icons>
              <H.Description dangerouslySetInnerHTML={{ __html: item.description }} />
              <H.WatchBtn>
                <H.WatchLink to={`/watch/${item.id}`}>
                  <FaPlayCircle />
                  Watch Now
                </H.WatchLink>
                <H.DetailLink to={`/anime/${item.id}`}>
                  Detail <FaChevronRight size={12} />
                </H.DetailLink>
              </H.WatchBtn>
            </H.Content>
          </H.Slides>
        ))}
      <div className="btn-prev">
        <FaChevronLeft />
      </div>
      <div className="btn-next">
        <FaChevronRight />
      </div>
    </H.Swiper>
  );
};

export default Hero;
