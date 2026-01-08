using Mapper;

namespace Service
{
    public class InfoService
    {
        public static HttpVO createInfo(CreateInfoVO createInfoVO)
        {
            HttpVO httpVO = new HttpVO();

            if (createInfoVO.Picture == null)
            {
                var userInfoDO = new UserInfoDO(
                UserId: createInfoVO.UserId,
                Name: createInfoVO.Name,
                Gender: createInfoVO.Gender,
                Age: createInfoVO.Age,
                Address: createInfoVO.Address,
                Specialization: createInfoVO.Specialization,
                ExperienceYears: createInfoVO.ExperienceYears,
                Bio: createInfoVO.Bio,
                Picture: "https://ddachlife.s3.ap-southeast-2.amazonaws.com/images/1ec17e46-90c8-4e82-9192-e7008f0be93f.png");
                UserInfoMapper.Insert(userInfoDO);
            }
            else
            {
                var userInfoDO = new UserInfoDO(
                UserId: createInfoVO.UserId,
                Name: createInfoVO.Name,
                Gender: createInfoVO.Gender,
                Age: createInfoVO.Age,
                Address: createInfoVO.Address,
                Specialization: createInfoVO.Specialization,
                ExperienceYears: createInfoVO.ExperienceYears,
                Bio: createInfoVO.Bio,
                Picture: createInfoVO.Picture);
                UserInfoMapper.Insert(userInfoDO);
            }
            
            httpVO.success = true;
            httpVO.message = "create successfully";
            return httpVO;
        }

        public static HttpVO deleteInfo(string id)
        {
            HttpVO httpVO = new HttpVO();
            UserInfoMapper.Delete(id);
            httpVO.success = true;
            httpVO.message = "delete successfully";
            return httpVO;
        }

        public static HttpVO updateInfo(UserInfoDO userInfoDO)
        {
            HttpVO httpVO = new HttpVO();
            UserInfoMapper.Update(userInfoDO);
            httpVO.success = true;
            httpVO.message = "update successfully";
            return httpVO;
        }

        public static HttpVO getInfo(string UserId)
        {
            HttpVO httpVO = new HttpVO();
            var userInfoDO = UserInfoMapper.SelectByUserId(UserId);
            httpVO.success = true;
            httpVO.message = "get successfully";
            httpVO.data = userInfoDO;
            return httpVO;
        }
    }
}