ALTER TABLE `dbo`.`Cart`
CHANGE COLUMN `ID` `ID` INT(11) NOT NULL AUTO_INCREMENT ;

ALTER TABLE `dbo`.`Category`
CHANGE COLUMN `ID` `ID` INT(11) NOT NULL AUTO_INCREMENT ;

ALTER TABLE `dbo`.`CustomerAccounts`
CHANGE COLUMN `ID` `ID` INT(11) NOT NULL AUTO_INCREMENT ;

ALTER TABLE `dbo`.`CustomerInfo`
CHANGE COLUMN `ID` `ID` INT(11) NOT NULL AUTO_INCREMENT ;

ALTER TABLE `dbo`.`Products`
CHANGE COLUMN `ID` `ID` INT(11) NOT NULL AUTO_INCREMENT ;

ALTER TABLE `dbo`.`Promotions`
CHANGE COLUMN `ID` `ID` INT(11) NOT NULL AUTO_INCREMENT ;

ALTER TABLE `dbo`.`Subcategory`
CHANGE COLUMN `ID` `ID` INT(11) NOT NULL AUTO_INCREMENT ;

ALTER TABLE `dbo`.`WishList`
CHANGE COLUMN `ID` `ID` INT(11) NOT NULL AUTO_INCREMENT ;

CREATE INDEX idx_Products_Active ON `dbo`.`Products` (`Active`) ;
CREATE INDEX idx_Products_Category ON `dbo`.`Products` (`Category`);
CREATE INDEX idx_Products_CategoryB ON `dbo`.`Products` (`CategoryB`);
CREATE INDEX idx_Products_CategoryC ON `dbo`.`Products` (`CategoryC`);
CREATE INDEX idx_Products_SubCategory ON `dbo`.`Products` (`SubCategory`);
CREATE INDEX idx_Products_SubCategoryB ON `dbo`.`Products` (`SubCategoryB`);
CREATE INDEX idx_Products_SubCategoryC ON `dbo`.`Products` (`SubCategoryC`);
CREATE INDEX idx_Subcategory_Category ON `dbo`.`Subcategory` (`Category`);
