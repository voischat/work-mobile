http://localhost:8090/v2/corp/auth/regist?appid=102036&et=1741491127&sign=e056a1e5
{
	"phone": "13353236455",
	"verifycode": "412604",
	"password": "e10adc3949ba59abbe56e057f20f883e"
}
{
	"errcode": 0,
	"errmsg": "请求成功",
	"data": {
		"country_code": "0",
		"password": "85afb53b4f60110b3eac365e5cd76d75",
		"user_number": "70012122"
	}
}

http://localhost:8090/v2/corp/auth/login-by-sms?appid=102036&et=1756088507&sign=7892cd37
{
	"phone": "18675500568",
	"country_code": "86",
	"verifycode": "123456"
}
{
	"errcode": 0,
	"errmsg": "请求成功",
	"data": {
		"access_token": "682051719b6b0e94c89b961b827b0f88",
		"account": {
			"country_code": "0",
			"password": "bd92fdffff87a91179b03c278d11d933",
			"user_number": "70011594"
		},
		"expires_in": 3650000000,
		"refresh_token": "398e2988a71840cd5899669c38c0fd9d",
		"user": {
			"user_id": 1253913,
			"user_num": "70011594",
			"job_num": "",
			"product": "",
			"imei": "",
			"sex": 0,
			"name": "企业主175203",
			"avatar": "http://weilacorp.oss-cn-shenzhen.aliyuncs.com/default/user.png",
			"is_admin": 1,
			"dept_id": 0,
			"phone": "18675500568",
			"country_code": "86",
			"state": 0,
			"type": 255,
			"tts": 1,
			"loc_share": 0,
			"track": 0,
			"grp_cnt": 0,
			"grp_lmt": 5,
			"created": 1756175203,
			"bind_phone": "18675500568",
			"bind_email": "18675500568@qq.com"
		}
	}
}

http://localhost:8090/v2/corp/auth/reset-password?appid=102036&et=1741491127&sign=e056a1e5
{
	"phone": "18675500568",
	"verifycode": "123456",
	"password": "e10adc3949ba59abbe56e057f20f883e"
}
{
	"errcode": 0,
	"errmsg": "请求成功"
}

http://localhost:8090/v2/corp/auth/login?appid=102036&et=1757990465&sign=ea37fa94
{
	"account": "18675500568",
	"password": "e10adc3949ba59abbe56e057f20f883e"
}
{
	"errcode": 0,
	"errmsg": "请求成功",
	"data": {
		"access_token": "66e9378cc95ade4c2da4cce32023e0fe",
		"account": {
			"country_code": "0",
			"password": "78aff4d3cf9a14e184d4d9e17af4aec1",
			"user_number": "70011594"
		},
		"expires_in": 3650000000,
		"refresh_token": "dcfeefb430817b12f8db674def50c849",
		"user": {
			"user_id": 1253913,
			"user_num": "70011594",
			"job_num": "",
			"product": "",
			"imei": "",
			"sex": 0,
			"name": "企业主175203",
			"avatar": "http://weilacorp.oss-cn-shenzhen.aliyuncs.com/default/user.png",
			"is_admin": 1,
			"dept_id": 0,
			"phone": "18675500568",
			"country_code": "86",
			"state": 0,
			"type": 255,
			"tts": 1,
			"loc_share": 0,
			"track": 0,
			"grp_cnt": 0,
			"grp_lmt": 5,
			"created": 1756175203,
			"bind_phone": "18675500568",
			"bind_email": "18675500568@qq.com"
		}
	}
}

http://localhost:8090/v2/corp/auth/refresh?appid=102036&et=1741491127&sign=e056a1e5&token=309e34dcbf5b27a8a8b48ada521e9c6a
{
	"refresh_token": "de162d6c964d797d774c77c6500f79df"
}
{
	"errcode": 0,
	"errmsg": "请求成功",
	"data": {
		"access_token": "4a7d770d63d7ed89cdee4448613b2460",
		"expires_in": 3650000000,
		"refresh_token": "79fe9b8e036c152f64c50e9d4f3ece04"
	}
}

http://localhost:8090/v2/corp/auth/regist-by-email?appid=102036&et=1741491127&sign=e056a1e5
{
	"email": "weila@qq.com",
	"verifycode": "412604",
	"password": "e10adc3949ba59abbe56e057f20f883e"
}
{
	"errcode": 0,
	"errmsg": "请求成功",
	"data": {
		"country_code": "0",
		"password": "85afb53b4f60110b3eac365e5cd76d75",
		"user_number": "70012122"
	}
}

http://localhost:8090/v2/corp/auth/login-by-email?appid=102036&et=1756088507&sign=7892cd37
{
	"email": "18675500568@qq.com",
	"verifycode": "123456"
}
{
	"errcode": 0,
	"errmsg": "请求成功",
	"data": {
		"access_token": "682051719b6b0e94c89b961b827b0f88",
		"account": {
			"country_code": "0",
			"password": "bd92fdffff87a91179b03c278d11d933",
			"user_number": "70011594"
		},
		"expires_in": 3650000000,
		"refresh_token": "398e2988a71840cd5899669c38c0fd9d",
		"user": {
			"user_id": 1253913,
			"user_num": "70011594",
			"job_num": "",
			"product": "",
			"imei": "",
			"sex": 0,
			"name": "企业主175203",
			"avatar": "http://weilacorp.oss-cn-shenzhen.aliyuncs.com/default/user.png",
			"is_admin": 1,
			"dept_id": 0,
			"phone": "18675500568",
			"country_code": "86",
			"state": 0,
			"type": 255,
			"tts": 1,
			"loc_share": 0,
			"track": 0,
			"grp_cnt": 0,
			"grp_lmt": 5,
			"created": 1756175203,
			"bind_phone": "18675500568",
			"bind_email": "18675500568@qq.com"
		}
	}
}

http://localhost:8090/v2/corp/auth/reset-password-by-email?appid=102036&et=1741491127&sign=e056a1e5
{
	"email": "18675500568",
	"verifycode": "123456",
	"password": "e10adc3949ba59abbe56e057f20f883e"
}
{
	"errcode": 0,
	"errmsg": "请求成功"
}

http://localhost:8090/v2/corp/org/create-org?appid=102036&et=1741491127&sign=e056a1e5&token=4e5bde85f8b3bff387b38f2f207ec4b2
{
	"name": "微喇测试",
	"avatar": "http://weilacorp.oss-cn-shenzhen.aliyuncs.com/corp/100011/a/0e9763d6.jpg"
}
{
	"errcode": 0,
	"errmsg": "请求成功",
	"data": {
		"org": {
			"org_num": 100196,
			"org_name": "微喇测试",
			"org_avatar": "http://weilacorp.oss-cn-shenzhen.aliyuncs.com/corp/100011/a/0e9763d6.jpg",
			"org_intro": "",
			"creator": 1253744,
			"member_count": 1,
			"dept_count": 0,
			"group_count": 0,
			"group_version": 1,
			"address_version": 1,
			"device_count": 0,
			"device_version": 1,
			"vip": 0,
			"vip_expired": 1753262835,
			"created": 1753262835
		}
	}
}

http://localhost:8090/v2/corp/org/change-org?appid=102036&et=1741491127&sign=e056a1e5&token=8ce1ec6b1eb5f3bd2ff435b5c0a89239
{
	"name": "aaaaa",
	"avatar": "http://weilacorp.oss-cn-shenzhen.aliyuncs.com/corp/100196/8de6_avt.jpg?v=1753266830"
}
{
	"errcode": 0,
	"errmsg": "请求成功",
	"data": {
		"org": {
			"org_num": 100196,
			"org_name": "222222",
			"org_avatar": "http://weilacorp.oss-cn-shenzhen.aliyuncs.com/corp/100196/8de6_avt.jpg?v=1753263066",
			"org_intro": "",
			"creator": 1253744,
			"member_count": 1,
			"dept_count": 0,
			"group_count": 0,
			"group_version": 1,
			"address_version": 1,
			"device_count": 0,
			"device_version": 1,
			"vip": 0,
			"vip_expired": 1753262835,
			"created": 1753262835
		}
	}
}

http://localhost:8090/v2/corp/org/get-my-org?appid=102036&et=1741491127&sign=e056a1e5&token=8ce1ec6b1eb5f3bd2ff435b5c0a89239
{
	"errcode": 0,
	"errmsg": "请求成功",
	"data": {
		"org": {
			"address_ver": 5,
			"avatar": "http://weilacorp.oss-cn-shenzhen.aliyuncs.com/corp/100196/8de6_avt.jpg?v=1753266830",
			"created": 1753262835,
			"creator": 1253744,
			"dept_cnt": 0,
			"device_cnt": 0,
			"device_ver": 1,
			"group_cnt": 0,
			"group_ver": 1,
			"intro": "",
			"member_cnt": 1,
			"name": "微喇测试",
			"num": 100196,
			"vip": 0,
			"vip_expired": 1753262835
		}
	}
}

http://localhost:8090/v2/corp/org/get-my-vip?appid=102036&et=1741491127&sign=e056a1e5&token=80545d0641192f3efe2296172d891b8d
{
	"errcode": 0,
	"errmsg": "请求成功",
	"data": {
		"vip": {
			"vip": 32,
			"vip_name": "专业版",
			"vip_expired": 1786696636,
			"vip_created": 1755074236,
			"vip_supports": [
				{
					"member_limit": 100,
					"name": "member",
					"support": true
				},
				{
					"dept_limit": 30,
					"dept_member_limit": 100,
					"name": "dept",
					"support": true
				},
				{
					"group_limit": 100,
					"group_member_limit": 100,
					"name": "group",
					"support": true
				},
				{
					"device_limit": 500,
					"name": "device",
					"support": true
				},
				{
					"name": "track",
					"quick_support": true,
					"support": true,
					"type": 2
				}
			]
		}
	}
}

http://localhost:8090/v2/corp/address/create-dept?appid=102036&et=1741491127&sign=e056a1e5&token=f718a8c0500807bb3a16ff25d1be5afd
{
	"name": "研发部4"
}
{
	"errcode": 0,
	"errmsg": "请求成功",
	"data": {
		"dept": {
			"id": 31,
			"name": "研发部1",
			"user_count": 0
		}
	}
}

http://localhost:8090/v2/corp/address/change-dept?appid=102036&et=1741491127&sign=e056a1e5&token=569f818794518a58d7b48cb2ee3e8e19
{
	"dept_id": 31,
	"name": "研发部22"
}
{
	"errcode": 0,
	"errmsg": "请求成功",
	"data": {
		"dept": {
			"id": 31,
			"name": "研发部22",
			"user_count": 0
		}
	}
}

http://localhost:8090/v2/corp/address/delete-dept?appid=102036&et=1741491127&sign=e056a1e5&token=f718a8c0500807bb3a16ff25d1be5afd
{
	"dept_id": 42
}
{
	"errcode": 0,
	"errmsg": "请求成功"
}

http://localhost:8090/v2/corp/address/get-dept-list?appid=102036&et=1741491127&sign=e056a1e5&token=6e2b6c3d8df0f129b3ba361cd64af18f&page=0&size=20
{
	"errcode": 0,
	"errmsg": "请求成功",
	"data": {
		"depts": [
			{
				"id": 32,
				"name": "研发部1",
				"user_count": 0
			}
		]
	}
}

http://localhost:8090/v2/corp/address/get-all-dept?appid=102036&et=1741491127&sign=e056a1e5&token=531b71d970308a5441b28e585785c377
{
	"errcode": 0,
	"errmsg": "请求成功",
	"data": {
		"depts": [
			{
				"id": 0,
				"name": "群组测试",
				"user_count": 3
			},
			{
				"id": 21,
				"name": "研发",
				"user_count": 0
			},
			{
				"id": 37,
				"name": "研发部1",
				"user_count": 0
			},
			{
				"id": 38,
				"name": "研发部1",
				"user_count": 0
			}
		]
	}
}

http://localhost:8090/v2/corp/address/add-dept-members?appid=102036&et=1741491127&sign=e056a1e5&token=f718a8c0500807bb3a16ff25d1be5afd
{
    "dept_id": 43,
    "user_ids":[1253749]
}
{
	"errcode": 0,
	"errmsg": "请求成功"
}

http://localhost:8090/v2/corp/address/delete-dept-members?appid=102036&et=1741491127&sign=e056a1e5&token=23c3da2043cf0b8d0c14ca3c2221e5e8
{
    "dept_id": 21,
    "user_id": 1253632
}
{
	"errcode": 0,
	"errmsg": "请求成功"
}

http://localhost:8090/v2/corp/address/get-dept-member-list?appid=102036&et=1741491127&sign=e056a1e5&token=b6a0b7dee7a10545a0d722edbd3c72b9&page=0&size=20
{
	"dept_id": 0,
	"member_types": [255],
	"key":"136"
}
{
	"errcode": 0,
	"errmsg": "请求成功",
	"data": {
		"count": 2,
		"members": [
			{
				"user_id": 1253632,
				"user_num": "70014985",
				"job_num": "",
				"sex": 0,
				"name": "成员1",
				"avatar": "http://weilacorp.oss-cn-shenzhen.aliyuncs.com/default/user.png",
				"is_admin": 0,
				"dept_id": 21,
				"phone": "18675500568",
				"country_code": "86",
				"state": 0,
				"type": 0,
				"tts": 1,
				"loc_share": 1,
				"track": 0,
				"group_count": 0,
				"online_status": 1,
				"created": 1752823588
			}
		]
	}
}

http://localhost:8090/v2/corp/address/get-dept-all-member?appid=102036&et=1741491127&sign=e056a1e5&token=b0251247053ff373c52a2b333a6cc261
{
	"dept_id": 21
}
{
	"errcode": 0,
	"errmsg": "请求成功",
	"data": {
		"members": [
			{
				"user_id": 1253745,
				"user_num": "70011106",
				"job_num": "123",
				"sex": 1,
				"name": "44444444",
				"avatar": "http://favicon.weila.hk/default/session.png",
				"is_admin": 0,
				"dept_id": 32,
				"phone": "18644444444",
				"country_code": "",
				"state": 0,
				"type": 0,
				"tts": 1,
				"loc_share": 1,
				"track": 0,
				"group_count": 0,
				"online_status": 1,
				"created": 1753344397
			}
		]
	}
}

http://localhost:8090/v2/corp/address/create-member?appid=102036&et=1741491127&sign=e056a1e5&token=4e5bde85f8b3bff387b38f2f207ec4b2
{
	"name": "44444444",
	"job_num": "123",
	"dept_id": 32,
	"sex": 1,
	"avatar": "http://favicon.weila.hk/default/session.png",
	"phone": "18644444445",
	"is_admin": 0,
	"loc_share": 1,
	"track": 0,
	"password": "b0251247053ff373c52a2b333a6cc261"
}
{
	"errcode": 0,
	"errmsg": "请求成功",
	"data": {
		"member": {
			"user_id": 1253747,
			"user_num": "300000010323",
			"job_num": "123",
			"sex": 1,
			"name": "44444444",
			"avatar": "http://favicon.weila.hk/default/session.png",
			"is_admin": 0,
			"dept_id": 32,
			"phone": "18644444445",
			"country_code": "86",
			"state": 0,
			"type": 0,
			"tts": 1,
			"loc_share": 1,
			"track": 0,
			"group_count": 0,
			"group_limit": 0,
			"created": 1753412941
		}
	}
}

http://localhost:8090/v2/corp/address/add-device?appid=102036&et=1741491127&sign=e056a1e5&token=46bd9084b6ef0e4601143d77abca8f70
{
	"verifycode": "563405",
	"name": "测试机Linux111",
	"job_num": "123",
	"dept_id": 0,
	"sex": 0,
	"avatar": "http://favicon.weila.hk/default/group.png",
	"phone": "18611111111",
	"loc_share": 1,
	"track": 1
}
{
	"errcode": 0,
	"errmsg": "请求成功",
	"data": {
		"member": {
			"user_id": 1253749,
			"user_num": "300000010463",
			"job_num": "123",
			"sex": 0,
			"name": "测试机Linux111",
			"avatar": "http://favicon.weila.hk/default/group.png",
			"is_admin": 0,
			"dept_id": 1,
			"phone": "18611111111",
			"country_code": "86",
			"state": 0,
			"type": 1,
			"tts": 1,
			"loc_share": 1,
			"track": 1,
			"grp_cnt": 0,
			"grp_lmt": 5,
			"created": 1754041901
		}
	}
}

http://localhost:8090/v2/corp/address/change-member?appid=102036&et=1741491127&sign=e056a1e5&token=9acd236aefd4ccb5c2aea0275202506f
{
	"user_id":1253746,
	"name": "111",
	"job_num": "122223",
	"dept_id": 31,
	"sex": 0,
	"avatar": "http://favicon.weila.hk/default/user.png",
	"phone": "18644444442",
	"is_admin": 1,
	"loc_share": 0,
	"track": 1
}
{
	"errcode": 0,
	"errmsg": "请求成功",
	"data": {
		"member": {
			"user_id": 1253746,
			"user_num": "70014440",
			"job_num": "122223",
			"sex": 0,
			"name": "111",
			"avatar": "http://favicon.weila.hk/default/user.png",
			"is_admin": 1,
			"dept_id": 31,
			"phone": "18644444442",
			"country_code": "",
			"state": 0,
			"type": 0,
			"tts": 0,
			"loc_share": 0,
			"track": 1,
      "group_count": 0,
			"created": 1753348676
		}
	}
}

http://localhost:8090/v2/corp/address/change-member-state?appid=102036&et=1741491127&sign=e056a1e5&token=b0251247053ff373c52a2b333a6cc261
{
	"user_id": 1253773,
	"state": 1
}
{
	"errcode": 0,
	"errmsg": "请求成功",
	"data": {
		"member": {
			"user_id": 1253746,
			"user_num": "70014440",
			"job_num": "122223",
			"sex": 0,
			"name": "111",
			"avatar": "http://weilacorp.oss-cn-shenzhen.aliyuncs.com/corp/100196/u/1253746/898b_avt.png?v=1753348785",
			"is_admin": 1,
			"dept_id": 31,
			"phone": "18644444442",
			"country_code": "",
			"state": 1,
			"type": 0,
			"tts": 0,
			"loc_share": 0,
			"track": 1,
            "group_count": 0,
			"created": 1753348676
		}
	}
}

http://localhost:8090/v2/corp/address/delete-member?appid=102036&et=1741491127&sign=e056a1e5&token=5959f34a00df8ea579569c136029d08d
{
	"user_id": 1253796
}
{
	"errcode": 0,
	"errmsg": "请求成功"
}

http://localhost:8090/v2/corp/address/get-member-list?appid=102036&et=1741491127&sign=e056a1e5&token=6574d4b340ea77ecb9f9aa06e89a97dd&page=0&size=20
{
    "dept_ids":[0,1],
    "member_types": [],
    "key":"136"
}
{
	"errcode": 0,
	"errmsg": "请求成功",
	"data": {
		"count": 4,
		"members": [
			{
				"user_id": 1253709,
				"user_num": "30015938",
				"job_num": "",
				"sex": 0,
				"name": "Linux客服",
				"avatar": "http://weilacorp.oss-cn-shenzhen.aliyuncs.com/default/user.png",
				"is_admin": 0,
				"dept_id": 0,
				"phone": "",
				"country_code": "86",
				"state": 0,
				"type": 1,
				"tts": 0,
				"loc_share": 0,
				"track": 0,
				"grp_cnt": 2,
				"grp_lmt": 5,
				"online_status": 1,
				"created": 1752823588
			}
		]
	}
}

http://localhost:8090/v2/corp/address/reset-member-password?appid=102036&et=1741491127&sign=e056a1e5&token=4e5bde85f8b3bff387b38f2f207ec4b2
{
	"user_id": 1253950,
	"password": "e10adc3949ba59abbe56e057f20f883e"
}
{
	"errcode": 0,
	"errmsg": "请求成功",
	"data": {
		"member": {
			"user_id": 1253746,
			"user_num": "70014440",
			"job_num": "122223",
			"sex": 0,
			"name": "111",
			"avatar": "http://weilacorp.oss-cn-shenzhen.aliyuncs.com/corp/100196/u/1253746/898b_avt.png?v=1753348785",
			"is_admin": 1,
			"dept_id": 31,
			"phone": "18644444442",
			"country_code": "",
			"state": 1,
			"type": 0,
			"tts": 0,
			"loc_share": 0,
			"track": 1,
            "group_count": 0,
			"created": 1753348676
		}
	}
}

http://localhost:8090/v2/corp/address/get-my-manage-all-dept?appid=102036&et=1741491127&sign=e056a1e5&token=8e516b4c33ce62627d989d389b97bca8
{
	"errcode": 0,
	"errmsg": "请求成功",
	"data": {
		"depts": [
			{
				"id": 0,
				"name": "群组测试",
				"user_count": 3
			},
			{
				"id": 21,
				"name": "研发",
				"user_count": 0
			},
			{
				"id": 37,
				"name": "研发部1",
				"user_count": 0
			},
			{
				"id": 38,
				"name": "研发部1",
				"user_count": 0
			}
		]
	}
}

http://localhost:8090/v2/corp/address/get-my-manage-dept-list?appid=102036&et=1741491127&sign=e056a1e5&token=8e516b4c33ce62627d989d389b97bca8&page=0&size=20
{
	"errcode": 0,
	"errmsg": "请求成功",
	"data": {
		"depts": [
			{
				"id": 32,
				"name": "研发部1",
				"user_count": 0
			}
		]
	}
}

http://localhost:8090/v2/corp/user/get-selfinfo?appid=102036&et=1757938916&sign=1f24f465&token=54b8abd09e0c8969445b82abc58e7801
{
	"errcode": 0,
	"errmsg": "请求成功",
	"data": {
		"user_id": 1253913,
		"user_num": "70011594",
		"job_num": "",
		"product": "",
		"imei": "",
		"sex": 0,
		"name": "企业主175203",
		"avatar": "http://weilacorp.oss-cn-shenzhen.aliyuncs.com/default/user.png",
		"is_admin": 1,
		"dept_id": 0,
		"phone": "18675500568",
		"country_code": "86",
		"state": 0,
		"type": 255,
		"tts": 1,
		"loc_share": 0,
		"track": 0,
		"grp_cnt": 0,
		"grp_lmt": 5,
		"created": 1756175203,
		"bind_phone": "18675500568",
		"bind_email": "18675500568@qq.com"
	}
}

http://localhost:8090/v2/corp/user/change-password?appid=102036&et=1741491127&sign=e056a1e5&token=aff536aa6d8f83751537ea65d51a2b0d
{
	"old_password": "e10adc3949ba59abbe56e057f20f883f",
	"new_password": "e10adc3949ba59abbe56e057f20f883e"
}

http://localhost:8090/v2/corp/user/bind-phone?appid=102036&et=1741491127&sign=e056a1e5&token=aff536aa6d8f83751537ea65d51a2b0d
{
	"phone": "13353236155",
	"country_code": "86",
	"verifycode": "412604"
}

http://localhost:8090/v2/corp/user/unregist?appid=102036&et=1757303011&sign=57305b2b&token=e2b5fbb3e02d572af498b847d8c5c71a
{
	"phone": "15600000001",
	"country_code": "86",
	"verifycode": "123456"
}

http://localhost:8090/v2/corp/user/bind-email?appid=102036&et=1741491127&sign=e056a1e5&token=aff536aa6d8f83751537ea65d51a2b0d
{
	"email": "13353236155@email",
	"verifycode": "412604"
}

http://localhost:8090/v2/corp/user/unregist-by-email?appid=102036&et=1757303011&sign=57305b2b&token=e2b5fbb3e02d572af498b847d8c5c71a
{
	"email": "15600000001@qq.com",
	"country_code": "86",
	"verifycode": "123456"
}

http://localhost:8090/v2/corp/group/create-group?appid=102036&et=1741491127&sign=e056a1e5&token=32a5dfb15c6c1507b860496076719a7f
{
	"dept_id": 0,
	"name": "测试群",
	"avatar": "http://weilacorp.oss-cn-shenzhen.aliyuncs.com/corp/100011/a/0e9763d6.jpg",
	"burst_mode": 1
}
{
	"errcode": 0,
	"errmsg": "请求成功",
	"data": {
		"group": {
			"id": 81000914,
			"dept_id": 0,
			"name": "测试群",
			"avatar": "http://weilacorp.oss-cn-shenzhen.aliyuncs.com/corp/100055/g/81000914/b440_avt.jpg?v=1753941387",
			"creator": 1253631,
			"type": 17,
			"user_count": 0,
			"member_version": 1,
			"burst_mode": 1,
			"created": 1753941387
		}
	}
}

http://localhost:8090/v2/corp/group/change-group?appid=102036&et=1741491127&sign=e056a1e5&token=20fe489743d711490b3c96dc8e46eaba
{
	"group_id": 81000914,
	"name": "测试群3",
	"avatar": "http://weilacorp.oss-cn-shenzhen.aliyuncs.com/corp/100011/a/0e9763d6.jpg",
	"burst_mode": 0
}

http://localhost:8090/v2/corp/group/delete-group?appid=102036&et=1741491127&sign=e056a1e5&token=20fe489743d711490b3c96dc8e46eaba
{
	"group_id": 81000914
}

http://localhost:8090/v2/corp/group/get-group-list?appid=102036&et=1741491127&sign=e056a1e5&token=5959f34a00df8ea579569c136029d08d&page=0&size=20
{
	"errcode": 0,
	"errmsg": "请求成功",
	"data": {
		"count": 2,
		"groups": [
			{
				"id": 81000822,
				"dept_id": 0,
				"name": "测试群",
				"avatar": "http://weilacorp.oss-cn-shenzhen.aliyuncs.com/corp/100055/g/81000822/9a22_avt.jpg?v=1753941216",
				"creator": 1253631,
				"type": 17,
				"user_count": 0,
				"member_version": 1,
				"burst_mode": 1,
				"created": 1753941216
			},
			{
				"id": 81000929,
				"dept_id": 0,
				"name": "群组1",
				"avatar": "http://weilacorp.oss-cn-shenzhen.aliyuncs.com/default/session.png",
				"creator": 1253631,
				"type": 17,
				"user_count": 4,
				"member_version": 10,
				"burst_mode": 0,
				"created": 1752823588
			}
		]
	}
}

http://localhost:8090/v2/corp/group/add-group-members?appid=102036&et=1741491127&sign=e056a1e5&token=81a9dd704538ae080a160403e2e92f0b
{
	"group_id": 81000822,
	"user_ids": [
		1253749,
		1253631,
		1253632
	]
}
{
	"errcode": 0,
	"errmsg": "请求成功"
}

http://localhost:8090/v2/corp/group/delete-group-member?appid=102036&et=1741491127&sign=e056a1e5&token=6af0948f2cc40a137c045ba43bc2dd0d
{
	"group_id": 81000822,
	"user_id": 1253749
}

http://localhost:8090/v2/corp/group/get-group-all-member?appid=102036&et=1741491127&sign=e056a1e5&token=20fe489743d711490b3c96dc8e46eaba
{
	"group_id": 81000822
}
{
	"errcode": 0,
	"errmsg": "请求成功",
	"data": {
		"members": [
			{
				"user_id": 1253631,
				"user_num": "70011662",
				"job_num": "",
				"sex": 0,
				"name": "ent88562945",
				"avatar": "http://weilacorp.oss-cn-shenzhen.aliyuncs.com/default/user.png",
				"is_admin": 0,
				"dept_id": 0,
				"phone": "18675500568",
				"country_code": "86",
				"state": 0,
				"type": 255,
				"tts": 1,
				"loc_share": 1,
				"track": 0,
				"group_count": 0,
				"online_status": 1,
				"created": 1752823588
			}
		]
	}
}

http://localhost:8090/v2/corp/group/get-group-member-list?appid=102036&et=1741491127&sign=e056a1e5&token=20fe489743d711490b3c96dc8e46eaba&page=0&size=20

http://localhost:8090/v2/corp/group/get-my-manage-group-list?appid=102036&et=1741491127&sign=e056a1e5&token=5959f34a00df8ea579569c136029d08d&page=0&size=20
{
	"errcode": 0,
	"errmsg": "请求成功",
	"data": {
		"count": 2,
		"groups": [
			{
				"id": 81000822,
				"dept_id": 0,
				"name": "测试群",
				"avatar": "http://weilacorp.oss-cn-shenzhen.aliyuncs.com/corp/100055/g/81000822/9a22_avt.jpg?v=1753941216",
				"creator": 1253631,
				"type": 17,
				"user_count": 0,
				"member_version": 1,
				"burst_mode": 1,
				"created": 1753941216
			},
			{
				"id": 81000929,
				"dept_id": 0,
				"name": "群组1",
				"avatar": "http://weilacorp.oss-cn-shenzhen.aliyuncs.com/default/session.png",
				"creator": 1253631,
				"type": 17,
				"user_count": 4,
				"member_version": 10,
				"burst_mode": 0,
				"created": 1752823588
			}
		]
	}
}


http://localhost:8090/v2/common/get-image-verifycode?appid=102036&et=1741491127&sign=e056a1e5&width=120&height=60
{
	"errcode": 0,
	"errmsg": "请求成功",
	"data": {
		"id": "M1XtRJfmKETk0yJV7MAC",
		"image": "data:image/png;base64,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"
	}
}

localhost:8090/v2/common/send-sms-verifycode?appid=102036&et=1741491127&sign=e056a1e5
{
	"phone": "18675500568",
	"countrycode": "86",
	"verify_id": "Rsc1jdehQ7ytHdof04Re", //验证码Id
    "verify_answer": "JTsv", //验证码回答
	"smstype": "work-regist" //work-regist 企业账号注册 work-login 企业账号登录 work-bind 企业版手机绑定 work-unbind 企业版手机号解绑
}


localhost:8090/v2/common/send-email-verifycode?appid=102036&et=1741491127&sign=e056a1e5
{
	"email": "215154317@qq.com",
	"verify_id": "Rsc1jdehQ7ytHdof04Re", //验证码Id
    "verify_answer": "JTsv", //验证码回答
	"smstype": "work-regist" //work-regist 企业账号注册 work-login 企业账号登录 work-bind 企业版手机绑定 work-unbind 企业版手机号解绑
}

http://localhost:8090/v2/corp/legal/get-legal?appid=102036&et=1741491127&sign=e056a1e5&token=d9e8fbb065dc78244d5a4eb66fc9afdb
{
	"errcode": 0,
	"errmsg": "请求成功",
	"data": {
		"legal": {
			"id": 4,
			"org_num": 100055,
			"category": 0,
			"name": "微喇",
			"identify": "b23456789012345678",
			"business_license": "http://weilacorp.oss-cn-shenzhen.aliyuncs.com/corp/legalc/100055/f4c2_lcbl.png?v=1752564412",
			"state": 0,
			"updated": "2025-07-15 15:26:52"
		}
	}
}

http://localhost:8090/v2/corp/legal/add-corp-legal?appid=102036&et=1741491127&sign=e056a1e5&token=d9e8fbb065dc78244d5a4eb66fc9afdb
{
    "name": "沃特",
    "identify": "a23456789012345678", //统一社会信用代码
    "business_license": "http://weilaavatar.oss-cn-shenzhen.aliyuncs.com/default/session.png" //企业营业执照
}
{
	"errcode": 0,
	"errmsg": "请求成功",
	"data": {
		"legal": {
			"id": 4,
			"org_num": 100055,
			"category": 0,
			"name": "沃特",
			"identify": "a23456789012345678",
			"business_license": "http://weilacorp.oss-cn-shenzhen.aliyuncs.com/corp/legalc/100055/f4c2_lcbl.png?v=1752564343",
			"state": 0,
			"updated": "2025-07-15 15:25:43"
		}
	}
}

http://localhost:8090/v2/corp/legal/add-corp-legal?appid=102036&et=1741491127&sign=e056a1e5&token=d9e8fbb065dc78244d5a4eb66fc9afdb
{
    "id": 4,
    "name": "微喇",
    "identify": "b23456789012345678", //身份证号
    "business_license": "http://weilaavatar.oss-cn-shenzhen.aliyuncs.com/default/session.png" //企业营业执照
}
{
	"errcode": 0,
	"errmsg": "请求成功",
	"data": {
		"legal": {
			"id": 4,
			"org_num": 100055,
			"category": 0,
			"name": "微喇",
			"identify": "b23456789012345678",
			"business_license": "http://weilacorp.oss-cn-shenzhen.aliyuncs.com/corp/legalc/100055/f4c2_lcbl.png?v=1752564412",
			"state": 0,
			"updated": "2025-07-15 15:26:52"
		}
	}
}

http://localhost:8090/v2/loc/regeo?appid=102036&et=1741491127&sign=e056a1e5&token=031f1b83d5dc0dd5ecf6fcf764906646
{
    "lat": 22.67166,
    "lon": 114.06795,
    "radius": 300 // default to be 300
}
{
	"errcode": 0,
	"errmsg": "请求成功",
	"data": {
		"regeo": {
			"province": "",
			"city": "",
			"citycode": "",
			"district": "",
			"adcode": "",
			"township": "",
			"Address": ""
		}
	}
}

https://www.voiswork.com/v2/corp/loc/get-track?appid=102036&et=1763975550&sign=9f4cc4c3&token=c9fd11ef13f5e21a5e8f4e5b10a51942
{
	"user_id": 1253732,
	"date": "2025-07-14"
}
{
	"errcode": 0,
	"errmsg": "请求成功",
	"data": {
		"count": 0,
		"tracks": [
			{
				"created": 1752484177,
				"lat": 22.671168782374878,
				"lng": 114.06565088351861
			},
			{
				"created": 1752484174,
				"lat": 22.671168782374878,
				"lng": 114.06565088351861
			},
			{
				"created": 1752484171,
				"lat": 22.671168782374878,
				"lng": 114.06565088351861
			},
			{
				"created": 1752484168,
				"lat": 22.671168782374878,
				"lng": 114.06565088351861
			},
			{
				"created": 1752484165,
				"lat": 22.671168782374878,
				"lng": 114.06565088351861
			},
			{
				"created": 1752484162,
				"lat": 22.671168782374878,
				"lng": 114.06565088351861
			},
			{
				"created": 1752484159,
				"lat": 22.671168782374878,
				"lng": 114.06565088351861
			},
			{
				"created": 1752484156,
				"lat": 22.671168782374878,
				"lng": 114.06565088351861
			},
			{
				"created": 1752484153,
				"lat": 22.671168782374878,
				"lng": 114.06565088351861
			},
			{
				"created": 1752484150,
				"lat": 22.671168782374878,
				"lng": 114.06565088351861
			},
			{
				"created": 1752484147,
				"lat": 22.671168782374878,
				"lng": 114.06565088351861
			},
			{
				"created": 1752484144,
				"lat": 22.671168782374878,
				"lng": 114.06565088351861
			},
			{
				"created": 1752484141,
				"lat": 22.671168782374878,
				"lng": 114.06565088351861
			},
			{
				"created": 1752484138,
				"lat": 22.671168782374878,
				"lng": 114.06565088351861
			},
			{
				"created": 1752484135,
				"lat": 22.671168782374878,
				"lng": 114.06565088351861
			},
			{
				"created": 1752484132,
				"lat": 22.671168782374878,
				"lng": 114.06565088351861
			},
			{
				"created": 1752484131,
				"lat": 22.67054,
				"lng": 114.065936
			},
			{
				"created": 1752484128,
				"lat": 22.671467508629547,
				"lng": 114.06544668610263
			},
			{
				"created": 1752484125,
				"lat": 22.671467508629547,
				"lng": 114.06544668610263
			},
			{
				"created": 1752484122,
				"lat": 22.671467508629547,
				"lng": 114.06544668610263
			}
		]
	}
}

http://www.voiswork.cn:8091/v2/corp/loc/get-realtime-location?appid=102065&et=1761032370&sign=73fe3278&token=319b738831fc52f7c43d11138ae94666
{
	"session_id": 0, // dept id | group id
	"session_type": 20 // 20 (部门) | 18 (群组)
}
{
	"errcode": 0,
	"errmsg": "请求成功",
	"data": {
		"locations": [
			{
				"uid": 1253968,
				"type": 0,
				"lat": 22.66980367006622,
				"lng": 112.07073400002416,
				"spd": 4.1,
				"rad": 3.3,
				"dir": 4.4,
				"ts": 1761030195
			}
		]
	}
}

http://localhost:8090/v2/corp/group/get-group-all-member?appid=102036&et=1741491127&sign=e056a1e5&token=20fe489743d711490b3c96dc8e46eaba
{
	"group_id": 81000822
}
{
	"errcode": 0,
	"errmsg": "请求成功",
	"data": {
		"members": [
			{
				"user_id": 1253631,
				"user_num": "70011662",
				"job_num": "",
				"sex": 0,
				"name": "ent88562945",
				"avatar": "http://weilacorp.oss-cn-shenzhen.aliyuncs.com/default/user.png",
				"is_admin": 0,
				"dept_id": 0,
				"phone": "18675500568",
				"country_code": "86",
				"state": 0,
				"type": 255,
				"tts": 1,
				"loc_share": 1,
				"track": 0,
				"group_count": 0,
				"online_status": 1,
				"created": 1752823588
			}
		]
	}
}
