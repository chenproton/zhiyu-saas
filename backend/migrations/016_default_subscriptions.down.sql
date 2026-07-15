-- 回滚：删除名为 '默认全功能套餐' 的套餐记录
-- 仅回滚本次迁移插入的默认套餐，不影响手动创建的套餐
DELETE FROM subscription_packages WHERE name = '默认全功能套餐';
