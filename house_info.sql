/*
 Navicat Premium Data Transfer

 Source Server         : 公司电脑
 Source Server Type    : MySQL
 Source Server Version : 80022
 Source Host           : localhost:3306
 Source Schema         : house_info

 Target Server Type    : MySQL
 Target Server Version : 80022
 File Encoding         : 65001

 Date: 26/03/2023 16:27:32
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for presell
-- ----------------------------
DROP TABLE IF EXISTS `presell`;
CREATE TABLE `presell`  (
  `mainKey` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL COMMENT '主键',
  `serial` smallint NULL DEFAULT NULL COMMENT '序号',
  `idCard` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL COMMENT '预售证名称',
  `idCardUrl` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL COMMENT '预售证详情地址',
  `productName` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL COMMENT '项目名称',
  `productUrl` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL COMMENT '项目详情地址',
  `enterprise` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL COMMENT '开发企业',
  `location` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL COMMENT '所在区',
  `authorizeDate` date NULL DEFAULT NULL COMMENT '批准时间',
  `reptileDate` datetime NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP COMMENT '爬取时间',
  PRIMARY KEY (`mainKey`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8 COLLATE = utf8_general_ci COMMENT = '深圳一手房预售信息' ROW_FORMAT = Dynamic;

SET FOREIGN_KEY_CHECKS = 1;
