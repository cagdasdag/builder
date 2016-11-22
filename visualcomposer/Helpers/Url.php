<?php

namespace VisualComposer\Helpers;

use VisualComposer\Framework\Illuminate\Support\Helper;

/**
 * Helper API methods related to make Url for plugin directory.
 * Class Url.
 */
class Url implements Helper
{
    /**
     * Helper method assetUrl for plugin assets folder.
     *
     * @param $path
     *
     * @return string
     */
    public function assetUrl($path)
    {
        return $this->to('visualcomposer/resources/' . ltrim($path, '\//'));
    }

    /**
     * Url to whole plugin folder.
     *
     * @param $path
     *
     * @return string
     */
    public function to($path)
    {
        return VCV_PLUGIN_URL . ltrim($path, '\//');
    }

    /**
     * Url to whole plugin folder.
     *
     * @param $query
     *
     * @return string
     */
    public function ajax($query = [])
    {
        $ajax = [VCV_AJAX_REQUEST => 1];
        $query = $ajax + $query;
        $url = get_site_url();
        $q = '?';
        /** @var Str $strHelper */
        $strHelper = vchelper('Str');
        $trim = true;
        if ($strHelper->contains($url, '?')) {
            $q = '&';
            $trim = false;
        }

        if ($trim) {
            $url = rtrim($url, '/\\') . '/';
        }

        return $url . $q . http_build_query($query);
    }

    /**
     * @return string
     */
    public function current()
    {
        $currentUrl = set_url_scheme('http://' . $_SERVER['HTTP_HOST'] . $_SERVER['REQUEST_URI']);

        return $currentUrl;
    }

    /**
     * @return bool|void
     */
    public function redirectIfUnauthorized()
    {
        if (!is_user_logged_in()) {
            wp_redirect(wp_login_url($this->current()));

            return $this->terminate();
        }

        return true;
    }

    /**
     * @param string $message
     */
    public function terminate($message = '')
    {
        die($message);
    }
}
