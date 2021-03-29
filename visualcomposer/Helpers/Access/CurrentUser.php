<?php

namespace VisualComposer\Helpers\Access;

if (!defined('ABSPATH')) {
    header('Status: 403 Forbidden');
    header('HTTP/1.1 403 Forbidden');
    exit;
}

use VisualComposer\Application;
use VisualComposer\Framework\Container;
use VisualComposer\Framework\Illuminate\Support\Helper;
use VisualComposer\Helpers\Access\Traits\Access;
use VisualComposer\Helpers\Access\Traits\Part;

/**
 * Available by vchelper('AccessCurrentUser').
 * Provides API to check access for current logged in used.
 * Class Access.
 */
class CurrentUser extends Container implements Helper
{
    use Access;
    use Part;

    /**
     * @param string $part
     *
     * @return $this
     */
    public function part($part)
    {
        $this->part = $part;
        // we also check for user "logged_in" status.
        require_once ABSPATH . "wp-includes/pluggable.php";
        $isUserLoggedIn = is_user_logged_in();
        $this->setValidAccess($isUserLoggedIn && $this->getValidAccess()); // send current status to upper level.

        return $this;
    }

    /**
     * @param $callback
     * @param $valid
     * @param $argsList
     *
     * @return $this
     */
    public function wpMulti($callback, $valid, $argsList)
    {
        if ($this->getValidAccess()) {
            require_once ABSPATH . "wp-includes/pluggable.php";
            $access = !$valid;
            /** @var Application $vcapp */
            $vcapp = vcapp();
            foreach ($argsList as &$args) {
                if (!is_array($args)) {
                    $args = [$args];
                }
                array_unshift($args, 'current_user_can');
                $this->setValidAccess(true);
                $vcapp->call($callback, $args);
                if ($valid === $this->getValidAccess()) {
                    $access = $valid;
                    break;
                }
            }
            $this->setValidAccess($access);
        }

        return $this;
    }

    /**
     * Check Wordpress capability. Should be valid one cap at least.
     *
     * @return $this
     */
    public function wpAny()
    {
        if ($this->getValidAccess()) {
            $args = func_get_args();
            $this->wpMulti([$this, 'check'], true, $args);
        }

        return $this;
    }

    /**
     * Check Wordpress capability. Should be valid all caps.
     *
     * @return $this
     */
    public function wpAll()
    {
        if ($this->getValidAccess()) {
            $args = func_get_args();
            $this->wpMulti([$this, 'check'], false, $args);
        }

        return $this;
    }

    /**
     * Get capability for current user.
     *
     * @param $rule
     *
     * @return bool
     */
    public function getCapRule($rule)
    {
        // Administrators have all access always
        if (in_array('administrator', wp_get_current_user()->roles)) {
            return true;
        }

        $roleRule = $this->getStateKey() . '_' . $rule;

        return current_user_can($roleRule);
    }

    /**
     * Add capability to role.
     *
     * @param $rule
     * @param bool $value
     *
     * @return $this
     */
    public function setCapRule($rule, $value = true)
    {
        $roleRule = $this->getStateKey() . '_' . $rule;

        wp_get_current_user()->add_cap($roleRule, $value);

        return $this;
    }

    /**
     * Can user do what he doo.
     * Any rule has three types of state: true, false, string.
     *
     * @param string $rule
     * @param bool|true $checkState
     *
     * @return $this
     * @throws \Exception
     */
    public function can($rule = '', $checkState = true)
    {
        $part = $this->getPart();
        if (empty($part)) {
            throw new \Exception('partName for User\Access is not set, please use ->part(partName) method to set!');
        }

        if (is_super_admin()) {
            $this->setValidAccess(true);

            return $this;
        }

        if ($this->getValidAccess()) {
            // Administrators have all access always
            if (in_array('administrator', wp_get_current_user()->roles)) {
                $this->setValidAccess(true);

                return $this;
            }
            $rule = $this->updateMergedCaps($rule);

            if (true === $checkState) {
                $state = $this->getState();
                $return = $state === true;
                if (is_bool($state)) {
                    $return = $state;
                } elseif ('' !== $rule) {
                    $return = $this->getCapRule($rule);
                }
            } else {
                $return = $this->getCapRule($rule);
            }
            $this->setValidAccess($return);
        }

        return $this;
    }

    public function setState($value = true)
    {
        if (is_null($value)) {
            wp_get_current_user()->remove_cap($this->getStateKey());
        } else {
            wp_get_current_user()->add_cap($this->getStateKey(), $value);
        }

        return $this;
    }

    /**
     * Get state of the Vc access rules part.
     *
     * @return mixed;
     * @throws \Exception
     */
    public function getState()
    {
        $allCaps = wp_get_current_user()->get_role_caps();
        $capKey = $this->getStateKey();
        $state = null;
        if (array_key_exists($capKey, $allCaps)) {
            $state = $allCaps[ $capKey ];
        }

        return vcfilter('vcv:access:currentUser:getState:accessWith:' . $this->getPart(), $state, $this->getPart());
    }
}
