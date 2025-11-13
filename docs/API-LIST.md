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
